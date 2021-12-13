import { IsOptional } from 'class-validator';

export class AtualizarJogadorDto {
  /*
  @IsNotEmpty()
  readonly nome: string;

  @IsNotEmpty()
  readonly telefoneCelular: string;
*/
  @IsOptional()
  categoria?: string;

  @IsOptional()
  urlFotoJogador: string;
}
