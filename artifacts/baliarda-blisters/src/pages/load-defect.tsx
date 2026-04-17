import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DEFECT_TYPE_LABELS } from "@/lib/constants";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateDefect, useUploadPhoto } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { DefectType } from "@workspace/api-client-react/src/generated/api.schemas";

const schema = z.object({
  opNumber: z.string().min(1, "Campo requerido"),
  bulkCode: z.string().min(1, "Campo requerido"),
  product: z.string().min(1, "Campo requerido"),
  lot: z.string().min(1, "Campo requerido"),
  orderQuantity: z.coerce.number().min(1, "Debe ser mayor a 0"),
  blistersPerBox: z.coerce.number().min(1, "Debe ser mayor a 0"),
  defectiveBlisters: z.coerce.number().min(0, "No puede ser negativo"),
  defectType: z.enum([
    "arrugas", "pisados", "codificado_cortado", "codificado_poco_legible",
    "blisters_vacio", "blisters_ausencia_comprimido", "blisters_comprimido_partido",
    "poco_segrinado", "polvo", "manchas", "pinchados"
  ]),
  observations: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function LoadDefect() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createDefect = useCreateDefect();
  const uploadPhoto = useUploadPhoto();
  
  const [labelPhotoUrl, setLabelPhotoUrl] = useState<string | null>(null);
  const [defectPhotoUrls, setDefectPhotoUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const labelPhotoInputRef = useRef<HTMLInputElement>(null);
  const defectPhotoInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      orderQuantity: 0,
      blistersPerBox: 0,
      defectiveBlisters: 0,
      opNumber: "",
      bulkCode: "",
      product: "",
      lot: "",
      observations: "",
    }
  });

  const orderQty = watch("orderQuantity");
  const blistersPerBox = watch("blistersPerBox");
  const defectiveBlisters = watch("defectiveBlisters");
  const selectedDefectType = watch("defectType");

  const totalBlisters = (orderQty || 0) * (blistersPerBox || 0);
  const incidenceRate = totalBlisters > 0 ? ((defectiveBlisters || 0) / totalBlisters) * 100 : 0;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isLabel: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Convert to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        
        const base64 = await base64Promise;
        const base64Data = base64.split(",")[1];
        
        const result = await uploadPhoto.mutateAsync({
          data: {
            data: base64Data,
            mimeType: file.type || "image/jpeg"
          }
        });

        if (isLabel) {
          setLabelPhotoUrl(result.url);
        } else {
          setDefectPhotoUrls(prev => [...prev, result.url]);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al subir la imagen.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset input
      if (e.target) e.target.value = '';
    }
  };

  const removeDefectPhoto = (index: number) => {
    setDefectPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormValues) => {
    createDefect.mutate({
      data: {
        ...data,
        totalBlisters,
        incidenceRate: parseFloat(incidenceRate.toFixed(2)),
        labelPhotoUrl,
        defectPhotoUrls,
        defectType: data.defectType as DefectType,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Guardado exitoso",
          description: "El defecto ha sido registrado correctamente."
        });
        setLocation("/");
      },
      onError: () => {
        toast({
          title: "Error",
          description: "No se pudo guardar el registro.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <Layout title="Cargar Defecto" showBack>
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
                <span className="text-lg font-bold text-primary">{totalBlisters.toLocaleString()} blisters</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registro de Defectos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Blisters con defecto observados</Label>
                  <Input type="number" {...register("defectiveBlisters")} />
                  {errors.defectiveBlisters && <p className="text-sm text-destructive">{errors.defectiveBlisters.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Tasa de incidencia</Label>
                  <div className="h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground flex items-center">
                    {incidenceRate.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de defecto</Label>
                <Controller
                  control={control}
                  name="defectType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un defecto" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DEFECT_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.defectType && <p className="text-sm text-destructive">{errors.defectType.message}</p>}
              </div>

              {selectedDefectType && (
                <div className="space-y-6 pt-4 border-t">
                  <div className="space-y-4">
                    <Label className="text-base">Foto del rótulo de la batea</Label>
                    <div className="flex gap-4 items-start">
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        className="hidden" 
                        ref={labelPhotoInputRef}
                        onChange={(e) => handleFileUpload(e, true)}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => labelPhotoInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Camera className="mr-2 h-4 w-4" /> Tomar Foto
                      </Button>
                      
                      {labelPhotoUrl && (
                        <div className="relative w-24 h-24 rounded-md overflow-hidden border">
                          <img src={labelPhotoUrl} alt="Rótulo" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setLabelPhotoUrl(null)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base">Fotos del defecto</Label>
                    <div className="flex flex-col gap-4">
                      <div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          multiple
                          className="hidden" 
                          ref={defectPhotoInputRef}
                          onChange={(e) => handleFileUpload(e, false)}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => defectPhotoInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          <Camera className="mr-2 h-4 w-4" /> Agregar Fotos
                        </Button>
                      </div>
                      
                      {defectPhotoUrls.length > 0 && (
                        <div className="flex flex-wrap gap-4">
                          {defectPhotoUrls.map((url, i) => (
                            <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden border">
                              <img src={url} alt={`Defecto ${i+1}`} className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => removeDefectPhoto(i)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Observaciones (opcional)</Label>
                <Textarea {...register("observations")} rows={4} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setLocation("/")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createDefect.isPending || isUploading}>
              {createDefect.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar Defecto
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
