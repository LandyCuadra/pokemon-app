export class CreatePokemonDto {
  name: string;
  height: number;
  weight: number;
  baseExperience: number;
  order: number;
  sprite: string;
  abilities: {
    isHidden: boolean;
    name: string;
    slot: number;
  }[];
  stats: {
    baseStat: number;
    effort: number;
    name: string;
  }[];
  types: string[];
}

export class UpdatePokemonDto {
  name: string;
  height: number;
  weight: number;
  baseExperience: number;
  order: number;
  sprite: string;
  abilities: {
    isHidden: boolean;
    name: string;
    slot: number;
  }[];
  stats: {
    baseStat: number;
    effort: number;
    name: string;
  }[];
  types: string[];
}

export class ApiPokemonDto {
  name: string;
  url: string;
}

export class QueryPokemon {
  limit: number;
  lastKey: string;
}
