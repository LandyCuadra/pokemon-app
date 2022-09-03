import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { DynamoDBHandler } from '../dynamodb/dynamodb.handler';
import {
  ApiPokemonDto,
  CreatePokemonDto,
  UpdatePokemonDto,
} from './dto/pokemon.dto';

@Injectable()
export class PokemonService {
  constructor(private readonly httpService: HttpService) {}

  async sync() {
    try {
      const { POKEMON_TABLE_NAME, MAX_POKEPROMISES, MAX_DBBATCH } = process.env;
      const pokemons: Array<ApiPokemonDto> = await lastValueFrom(
        this.httpService
          .get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=1126')
          .pipe(map((resp) => resp.data.results)),
      );

      let pokePromises: Promise<any>[] = [];
      const dynamoPromises: Promise<any>[] = [];
      for (const [index, pokemon] of pokemons.entries()) {
        pokePromises.push(
          lastValueFrom(
            this.httpService.get(pokemon.url).pipe(map((resp) => resp.data)),
          ),
        );

        if (
          pokePromises.length === parseInt(MAX_POKEPROMISES) ||
          index + 1 === pokemons.length
        ) {
          const pokemonDetails = await Promise.all(pokePromises);
          pokePromises = [];
          pokemonDetails.reduce((acc, val, detailIndex) => {
            acc.push({
              PutRequest: {
                Item: {
                  id: val.id.toString(),
                  name: val.name,
                  baseExperience: val.base_experience,
                  height: val.height,
                  weight: val.weight,
                  order: val.order,
                  sprite: val.sprites.front_default,
                  stats: val.stats.reduce(
                    (acc: any, val: any) =>
                      acc.concat({
                        baseStat: val.base_stat,
                        effort: val.effort,
                        name: val.stat.name,
                      }),
                    [],
                  ),
                  abilities: val.abilities.reduce(
                    (acc: any, val: any) =>
                      acc.concat({
                        slot: val.slot,
                        isHidden: val.is_hidden,
                        name: val.ability.name,
                      }),
                    [],
                  ),
                  types: val.types.reduce(
                    (acc: any, val: any) =>
                      acc.concat({
                        slot: val.slot,
                        name: val.type.name,
                      }),
                    [],
                  ),
                },
              },
            });

            if (
              acc.length === parseInt(MAX_DBBATCH) ||
              detailIndex + 1 === pokemonDetails.length
            ) {
              dynamoPromises.push(
                new DynamoDBHandler(POKEMON_TABLE_NAME).batchWrite(acc),
              );

              acc = [];
            }

            return acc;
          }, []);
        }
      }
      await Promise.all(dynamoPromises);
      console.log(dynamoPromises.length);
    } catch (err) {
      console.log(err);
    }
  }

  create(createPokemonDto: CreatePokemonDto) {
    return 'This action adds a new pokemon';
  }

  findAll() {
    console.log(process.env.POKEMON_TABLE_NAME);
    return new DynamoDBHandler(process.env.POKEMON_TABLE_NAME).get();
  }

  findOne(id: number) {
    return `This action returns a #${id} pokemon`;
  }

  update(id: number, updatePokemonDto: UpdatePokemonDto) {
    return `This action updates a #${id} pokemon`;
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }
}
