import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { DynamoDBHandler } from '../dynamodb/dynamodb.handler';
import {
  ApiPokemonDto,
  CreatePokemonDto,
  UpdatePokemonDto,
} from './dto/pokemon.dto';
const KEY_NAME = 'id';

@Injectable()
export class PokemonService {
  keyName: string;
  dynamodb: DynamoDBHandler;
  maxDbBatch: number;
  maxPokePromises: number;
  defaultExpressionAttributeNames: any;
  defaultProjectionExpression: string;

  constructor(private readonly httpService: HttpService) {
    const { POKEMON_TABLE_NAME, MAX_POKEPROMISES, MAX_DBBATCH } = process.env;

    this.keyName = 'id';
    this.maxDbBatch = +MAX_DBBATCH;
    this.maxPokePromises = +MAX_POKEPROMISES;
    this.keyName = KEY_NAME;
    this.defaultExpressionAttributeNames = {
      '#name': 'name',
      '#order': 'order',
    };
    this.defaultProjectionExpression =
      'id, #name, #order, baseExperience, types';
    this.dynamodb = new DynamoDBHandler(
      POKEMON_TABLE_NAME,
      this.defaultProjectionExpression,
      this.defaultExpressionAttributeNames,
    );
  }

  async sync() {
    try {
      await this.dynamodb.CreateTable(this.keyName);

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
          pokePromises.length === this.maxPokePromises ||
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
                  types: val.types.map((typeObj: any) => typeObj.type.name),
                },
              },
            });

            if (
              acc.length === this.maxDbBatch ||
              detailIndex + 1 === pokemonDetails.length
            ) {
              dynamoPromises.push(this.dynamodb.batchWrite(acc));

              acc = [];
            }

            return acc;
          }, []);
        }
      }
      await Promise.all(dynamoPromises);
    } catch (err) {
      console.log(err);
    }
  }

  create(pokemon: CreatePokemonDto) {
    return this.dynamodb.putItem(this.keyName, pokemon);
  }

  findAll(limit: number, lastKey: string) {
    return this.dynamodb.get(limit, { ...(lastKey && { id: lastKey }) });
  }

  findOne(id: string) {
    return this.dynamodb.getByEqQuery({ name: id, id });
  }

  findByType(type: string) {
    const dynamoQuery = {
      FilterExpression: 'contains(#types, :types)',
      ExpressionAttributeNames: {
        '#types': 'types',
        ...this.defaultExpressionAttributeNames,
      },
      ExpressionAttributeValues: { ':types': type },
      ProjectionExpression: this.defaultProjectionExpression,
    };
    return this.dynamodb.getByCustomQuery(dynamoQuery);
  }

  update(id: string, pokemon: UpdatePokemonDto) {
    return this.dynamodb.updateItem({ id }, pokemon);
  }
}
