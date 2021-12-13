import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Jogador } from './interfaces/jogador.interface';

@Injectable()
export class JogadoresService {
  constructor(
    @InjectModel('Jogador') private readonly jogadorModel: Model<Jogador>,
  ) {}

  logger = new Logger(JogadoresService.name);

  async criarJogador(jogador: Jogador) {
    try {
      const jogadorCriado = new this.jogadorModel(jogador);

      return jogadorCriado.save();
    } catch (error) {
      this.logger.error(`Error ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async consultarTodosJogadores() {
    try {
      return await this.jogadorModel.find().exec();
    } catch (error) {
      this.logger.error(`Error ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async consultarJogadoresPorId(_id: string) {
    try {
      return await this.jogadorModel.findById(_id).exec();
    } catch (error) {
      this.logger.error(`Error ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async atualizarJogador(data: any) {
    const { _id } = data;
    const jogador = data.atualizarJogadorDto;

    try {
      return this.jogadorModel
        .findOneAndUpdate({ _id }, { $set: jogador })
        .exec();
    } catch (error) {
      this.logger.error(`Error ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async deletarJogador(_id: string) {
    try {
      return this.jogadorModel.findOneAndDelete({ _id }).exec();
    } catch (error) {
      this.logger.error(`Error ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
