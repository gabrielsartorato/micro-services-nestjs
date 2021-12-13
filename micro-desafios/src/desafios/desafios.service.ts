import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DesafioStatus } from './interfaces/desafio-status.enum';
import { Desafio } from './interfaces/desafio.interface';

@Injectable()
export class DesafiosService {
  private readonly logger = new Logger(DesafiosService.name);

  constructor(
    @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
  ) {}

  async criarDesafio(desafio: Desafio): Promise<Desafio> {
    try {
      const desafioCriado = new this.desafioModel(desafio);

      desafioCriado.dataHoraSolicitacao = new Date();
      desafioCriado.status = DesafioStatus.PENDENTE;

      return await desafioCriado.save();
    } catch (err) {
      this.logger.error(`Error ${JSON.stringify(err.message)}`);
      throw new RpcException(err.message);
    }
  }

  async consultarTodosDesafio(): Promise<Desafio[]> {
    try {
      const desafios = await this.desafioModel.find().exec();

      return desafios;
    } catch (err) {
      this.logger.error(`Error ${JSON.stringify(err.message)}`);
      throw new RpcException(err.message);
    }
  }

  async consultarDesafiosDeUmJogador(_id: any): Promise<Desafio[]> {
    try {
      const desafio = await this.desafioModel
        .find()
        .where('jogadores')
        .in(_id)
        .exec();

      return desafio;
    } catch (err) {
      this.logger.error(`Error ${JSON.stringify(err.message)}`);
      throw new RpcException(err.message);
    }
  }

  async consultarDesafioPorId(_id: string): Promise<Desafio> {
    try {
      const desafio = await this.desafioModel.findOne({ _id }).exec();

      return desafio;
    } catch (err) {
      this.logger.error(`Error ${JSON.stringify(err.message)}`);
      throw new RpcException(err.message);
    }
  }

  async atualizarDesafio(_id: string, desafio: Desafio): Promise<Desafio> {
    console.log(_id);
    try {
      const desafioAtualizado = await this.desafioModel
        .findOneAndUpdate({ _id }, { $set: desafio })
        .exec();

      return desafioAtualizado;
    } catch (err) {
      this.logger.error(`Error ${JSON.stringify(err.message)}`);
      throw new RpcException(err.message);
    }
  }

  async atualizarDesafioPartida(_id: string, desafio: Desafio) {
    try {
      const desafioEncontrado = await this.consultarDesafioPorId(desafio._id);

      Object.assign(desafioEncontrado, { partida: _id });

      await this.desafioModel.findOneAndUpdate(
        { _id: desafioEncontrado._id },
        { $set: desafioEncontrado },
      );
    } catch (err) {
      this.logger.error(`Error ${JSON.stringify(err.message)}`);
      throw new RpcException(err.message);
    }
  }

  async deletarDesafio(_id: string): Promise<Desafio> {
    try {
      const desafio = await this.desafioModel.findById(_id).exec();

      Object.assign(desafio, { status: DesafioStatus.CANCELADO });

      await this.desafioModel.findOneAndUpdate({ _id }, { $set: desafio });

      return desafio;
    } catch (err) {
      this.logger.error(`Error ${JSON.stringify(err.message)}`);
      throw new RpcException(err.message);
    }
  }
}
