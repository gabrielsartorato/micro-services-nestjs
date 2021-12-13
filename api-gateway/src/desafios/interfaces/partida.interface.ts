import { Jogador } from 'src/jogadores/interfaces/jogador.interface';

export interface Partida {
  categoria?: string;
  desafio?: string;
  jogadores?: Jogador[];
  def?: Jogador;
  resultado?: Resultado[];
}

export interface Resultado {
  set: string;
}
