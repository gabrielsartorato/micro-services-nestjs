import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CategoriasService } from './categorias.service';
import { Categoria } from './interfaces/categoria.interface';

const ackErrors: string[] = ['E11000'];

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriaService: CategoriasService) {}
  logger = new Logger(CategoriasController.name);

  @EventPattern('criar-categoria')
  async criarCategoria(
    @Payload() categoria: Categoria,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    this.logger.log(`categoria: ${JSON.stringify(categoria)}`);

    try {
      await this.categoriaService.criarCategoria(categoria);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      const filterAckerror = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckerror) {
        await channel.ack(originalMsg);
      }
    }
  }

  @MessagePattern('consultar-categorias')
  async consultarCategorias(
    @Payload() _id: string,
    @Ctx() context: RmqContext,
  ) {
    // resgatar o canal da mensagem do RabbitMQ
    const channel = context.getChannelRef();
    // resgatar a mensagem original do RabbitMQ
    const originalMsg = context.getMessage();

    try {
      if (_id) {
        const categoria = await this.categoriaService.consultarCategoriaPeloId(
          _id,
        );
        return categoria;
      } else {
        return await this.categoriaService.consultarTodasCategorias();
      }
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @EventPattern('atualizar-categoria')
  async atualizarCategoria(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    this.logger.log(`data: ${JSON.stringify(data)}`);

    try {
      const _id: string = data.id;
      const categoria: Categoria = data.categoria;
      await this.categoriaService.atualizarCategoria(_id, categoria);
      await channel.ack(originalMsg);
    } catch (err) {
      this.logger.error(`error: ${JSON.stringify(err.message)}`);

      const filterAckerror = ackErrors.filter((ackError) =>
        err.message.includes(ackError),
      );

      if (filterAckerror) {
        await channel.ack(originalMsg);
      }
    }
  }
}
