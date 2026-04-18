import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DEFECT_TYPE_LABELS, ALL_DEFECT_TYPES } from "@/lib/constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateDefect,
  useUpdateDefect,
  useGetDefect,
  useUploadPhoto,
  getListDefectsQueryKey,
  getGetDefectQueryKey,
} from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { Camera, ImageIcon, X, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  opNumber: z.string().min(1, "Campo requerido"),
  bulkCode: z.string().min(1, "Campo requerido"),
  product: z.string().min(1, "Campo requerido"),
  lot: z.string().min(1, "Campo requerido"),
  orderQuantity: z.coerce.number().min(1, "Debe ser mayor a 0"),
  blistersPerBox: z.coerce.number().min(1, "Debe ser mayor a 0"),
  observations: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function LoadDefect() {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const editId = params.get("id") ? Number(params.get("id")) : null;
  const isEditing = editId !== null;

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createDefect = useCreateDefect();
  const updateDefect = useUpdateDefect();
  const uploadPhoto = useUploadPhoto();

  const { data: existingDefect, isLoading: loadingExisting } = useGetDefect(editId!, {
    query: {
      enabled: isEditing,
      queryKey: getGetDefectQueryKey(editId!),
    },
  });

  const [selectedDefects, setSelectedDefects] = useState<Record<string, number>>({});
  const [labelPhotoUrl, setLabelPhotoUrl] = useState<string | null>(null);
  const [defectPhotoUrls, setDefectPhotoUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const labelPhotoCameraRef = useRef<HTMLInputElement>(null);
  const labelPhotoGalleryRef = useRef<HTMLInputElement>(null);
  const defectPhotoCameraRef = useRef<HTMLInputElement>(null);
  const defectPhotoGalleryRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      orderQuantity: 0,
      blistersPerBox: 0,
      opNumber: "",
      bulkCode: "",
      product: "",
      lot: "",
      observations: "",
    },
  });

  useEffect(() => {
    if (existingDefect) {
      reset({
        opNumber: existingDefect.opNumber,
        bulkCode: existingDefect.bulkCode,
        product: existingDefect.product,
        lot: existingDefect.lot,
        orderQuantity: existingDefect.orderQuantity,
        blistersPerBox: existingDefect.blistersPerBox,
        observations: existingDefect.observations ?? "",
      });
      setLabelPhotoUrl(existingDefect.labelPhotoUrl ?? null);
      setDefectPhotoUrls(existingDefect.defectPhotoUrls ?? []);
      if (existingDefect.defectItems && existingDefect.defectItems.length > 0) {
        const map: Record<string, number> = {};
        for (const item of existingDefect.defectItems) {
          map[item.type] = item.count;
        }
        setSelectedDefects(map);
      } else if (existingDefect.defectType) {
        setSelectedDefects({ [existingDefect.defectType]: existingDefect.defectiveBlisters });
      }
    }
  }, [existingDefect, reset]);

  const orderQty = watch("orderQuantity");
  const blistersPerBox = watch("blistersPerBox");

  const totalBlisters = (orderQty || 0) * (blistersPerBox || 0);
  const defectiveBlisters = Object.values(selectedDefects).reduce((s, c) => s + (c || 0), 0);
  const incidenceRate = totalBlisters > 0 ? (defectiveBlisters / totalBlisters) * 100 : 0;

  const toggleDefectType = (type: string, checked: boolean) => {
    setSelectedDefects((prev) => {
      const next = { ...prev };
      if (checked) {
        next[type] = next[type] ?? 1;
      } else {
        delete next[type];
      }
      return next;
    });
  };

  const setDefectCount = (type: string, count: number) => {
    setSelectedDefects((prev) => ({ ...prev, [type]: count < 0 ? 0 : count }));
  };

  const compressImage = (file: File, maxWidth = 1600, quality = 0.8): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas no disponible")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve({ data: dataUrl.split(",")[1], mimeType: "image/jpeg" });
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo leer la imagen")); };
      img.src = url;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isLabel: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const { data: base64Data, mimeType } = await compressImage(files[i]);
        const result = await uploadPhoto.mutateAsync({ data: { data: base64Data, mimeType } });
        if (isLabel) {
          setLabelPhotoUrl(result.url);
        } else {
          setDefectPhotoUrls((prev) => [...prev, result.url]);
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      toast({
        title: "Error al subir la imagen",
        description: msg.includes("503") || msg.includes("Cloudinary")
          ? "Servicio de imágenes no configurado en el servidor."
          : "Verificá tu conexión e intentá de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const onSubmit = (data: FormValues) => {
    if (Object.keys(selectedDefects).length === 0) {
      toast({ title: "Seleccioná al menos un tipo de defecto", variant: "destructive" });
      return;
    }

    const defectItems = Object.entries(selectedDefects)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => ({ type, count }));

    const defectType = defectItems[0]?.type ?? "";

    const payload = {
      ...data,
      totalBlisters,
      defectiveBlisters,
      incidenceRate: parseFloat(incidenceRate.toFixed(2)),
      defectType,
      defectItems,
      labelPhotoUrl,
      defectPhotoUrls,
    };

    const onSuccess = () => {
      toast({
        title: isEditing ? "Registro actualizado" : "Guardado exitoso",
        description: isEditing
          ? "Los cambios fueron guardados correctamente."
          : "El defecto fue registrado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: getListDefectsQueryKey() });
      if (isEditing) queryClient.invalidateQueries({ queryKey: getGetDefectQueryKey(editId!) });
      setLocation("/defectos-observados");
    };

    const onError = () => {
      toast({ title: "Error", description: "No se pudo guardar el registro.", variant: "destructive" });
    };

    if (isEditing) {
      updateDefect.mutate({ id: editId!, data: payload }, { onSuccess, onError });
    } else {
      createDefect.mutate({ data: payload }, { onSuccess, onError });
    }
  };

  const isPending = createDefect.isPending || updateDefect.isPending;

  if (isEditing && loadingExisting) {
    return (
      <Layout title="Editar Defecto" showBack>
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isEditing ? "Editar Defecto" : "Cargar Defecto"} showBack>
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Lote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>N° de OP</Label>
                  <Input {...register("opNumber")} />
                  {errors.opNumber && <p className="text-sm text-destructive">{errors.opNumber.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Código del Granel</Label>
                  <Input {...register("bulkCode")} />
                  {errors.bulkCode && <p className="text-sm text-destructive">{errors.bulkCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Producto</Label>
                  <Input {...register("product")} />
                  {errors.product && <p className="text-sm text-destructive">{errors.product.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Lote</Label>
                  <Input {...register("lot")} />
                  {errors.lot && <p className="text-sm text-destructive">{errors.lot.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cálculo de Blisters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cantidad de la orden</Label>
                  <Input type="number" {...register("orderQuantity")} />
                  {errors.orderQuantity && <p className="text-sm text-destructive">{errors.orderQuantity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Cantidad de blisters por estuche</Label>
                  <Input type="number" {...register("blistersPerBox")} />
                  {errors.blistersPerBox && <p className="text-sm text-destructive">{errors.blistersPerBox.message}</p>}
                </div>
              </div>
              <div className="p-4 bg-muted rounded-md flex justify-between items-center">
                <span className="font-medium">Total de blisters a producir:</span>
                <span className="text-lg font-bold text-primary">{totalBlisters.toLocaleString("es-AR")} blisters</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registro de Defectos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base mb-3 block">
                  Tipos de defecto observados <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Tildá los defectos encontrados e ingresá la cantidad de blisters afectados por cada uno.
                </p>
                <div className="space-y-3">
                  {ALL_DEFECT_TYPES.map((type) => {
                    const isChecked = type in selectedDefects;
                    return (
                      <div key={type} className="flex items-center gap-4 p-3 rounded-md border bg-background hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id={`defect-${type}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => toggleDefectType(type, !!checked)}
                        />
                        <Label htmlFor={`defect-${type}`} className="flex-1 cursor-pointer font-normal">
                          {DEFECT_TYPE_LABELS[type]}
                        </Label>
                        {isChecked && (
                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-muted-foreground whitespace-nowrap">Cant.:</Label>
                            <Input
                              type="number"
                              min={0}
                              value={selectedDefects[type] ?? 1}
                              onChange={(e) => setDefectCount(type, parseInt(e.target.value) || 0)}
                              className="w-24 h-8 text-center"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">Blisters con defecto (total):</span>
                  <span className="text-lg font-bold text-destructive">{defectiveBlisters}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">Tasa de incidencia:</span>
                  <span className="text-lg font-bold text-destructive">{incidenceRate.toFixed(2)}%</span>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t">
                <div className="space-y-3">
                  <Label className="text-base">Foto del rótulo de la batea</Label>
                  <div className="flex flex-wrap gap-3 items-start">
                    <input type="file" accept="image/*" capture="environment" className="hidden" ref={labelPhotoCameraRef} onChange={(e) => handleFileUpload(e, true)} />
                    <input type="file" accept="image/*" className="hidden" ref={labelPhotoGalleryRef} onChange={(e) => handleFileUpload(e, true)} />
                    <Button type="button" variant="outline" onClick={() => labelPhotoCameraRef.current?.click()} disabled={isUploading}>
                      <Camera className="mr-2 h-4 w-4" /> Tomar Foto
                    </Button>
                    <Button type="button" variant="outline" onClick={() => labelPhotoGalleryRef.current?.click()} disabled={isUploading}>
                      <ImageIcon className="mr-2 h-4 w-4" /> Elegir de Galería
                    </Button>
                    {labelPhotoUrl && (
                      <div className="relative w-24 h-24 rounded-md overflow-hidden border">
                        <img src={labelPhotoUrl} alt="Rótulo" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setLabelPhotoUrl(null)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base">Fotos del defecto</Label>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-3">
                      <input type="file" accept="image/*" capture="environment" multiple className="hidden" ref={defectPhotoCameraRef} onChange={(e) => handleFileUpload(e, false)} />
                      <input type="file" accept="image/*" multiple className="hidden" ref={defectPhotoGalleryRef} onChange={(e) => handleFileUpload(e, false)} />
                      <Button type="button" variant="outline" onClick={() => defectPhotoCameraRef.current?.click()} disabled={isUploading}>
                        <Camera className="mr-2 h-4 w-4" /> Tomar Fotos
                      </Button>
                      <Button type="button" variant="outline" onClick={() => defectPhotoGalleryRef.current?.click()} disabled={isUploading}>
                        <ImageIcon className="mr-2 h-4 w-4" /> Elegir de Galería
                      </Button>
                      {isUploading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Subiendo imagen...</div>}
                    </div>
                    {defectPhotoUrls.length > 0 && (
                      <div className="flex flex-wrap gap-4">
                        {defectPhotoUrls.map((url, i) => (
                          <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden border">
                            <img src={url} alt={`Defecto ${i + 1}`} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setDefectPhotoUrls((prev) => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observaciones (opcional)</Label>
                <Textarea {...register("observations")} rows={4} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setLocation(isEditing ? "/defectos-observados" : "/")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || isUploading}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isEditing ? "Guardar Cambios" : "Guardar Defecto"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
