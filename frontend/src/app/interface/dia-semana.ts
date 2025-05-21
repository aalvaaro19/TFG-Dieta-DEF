import { Receta } from "./receta";

export enum DiasSemana {
  LUNES = 'LUNES',
  MARTES = 'MARTES',
  MIERCOLES = 'MIERCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES',
  SABADO = 'SABADO',
  DOMINGO = 'DOMINGO'
}

export interface DiaSemana {
  id_diaSemana?: string;
  dia_semana: string | object; 
  receta: Receta[];
  objetivoCaloriasDelDia: number;
  objetivoProteinasDelDia: number;
  objetivoCarbohidratosDelDia: number;
  objetivoGrasasDelDia: number;
  numeroComidasDia: number;
  recomendacionesDelDia: string;
  fechaDia: string;
  estadoDia: string;
}
