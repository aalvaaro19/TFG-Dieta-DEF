export interface Receta {
  id_receta: string;
  nombre: string;
  descripcion: string;
  ingredientes: string[];
  cantidades: string[];
  calorias: string;
  cantidad_carbohidratos: string;
  cantidad_proteinas: string;
  cantidad_grasas: string;
  tiempo_preparacion: string;
  dificultad: string;
  imagen: string;
}