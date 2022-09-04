import { Controller, Get, Post, Body, Param, Query, Put } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import {
  CreatePokemonDto,
  QueryPokemon,
  UpdatePokemonDto,
} from './dto/pokemon.dto';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Post('sync')
  async sync() {
    await this.pokemonService.sync();
    return { message: 'synchronized' };
  }

  @Post()
  async create(@Body() pokemon: CreatePokemonDto) {
    const id = await this.pokemonService.create(pokemon);
    return { message: 'saved', id };
  }

  @Get()
  findAll(@Query() query: QueryPokemon) {
    const { limit, lastKey } = query;
    return this.pokemonService.findAll(limit, lastKey);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pokemonService.findOne(id);
  }

  @Get('type/:type')
  findByType(@Param('type') type: string) {
    return this.pokemonService.findByType(type);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() pokemon: UpdatePokemonDto) {
    await this.pokemonService.update(id, pokemon);
    return { message: 'updated' };
  }
}
