import { IsEmail, IsNotEmpty } from 'class-validator';

export class CriarJogadorDto {
  @IsNotEmpty()
  readonly nome: string;

  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly telefoneCelular: string;

  @IsNotEmpty()
  readonly categoria: string;
}
