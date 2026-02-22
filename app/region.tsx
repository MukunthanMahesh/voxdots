import { Link, useLocalSearchParams } from "expo-router";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import type { SvgProps } from "react-native-svg";
import BugIcon from "../assets/type_icons/bug.svg";
import DarkIcon from "../assets/type_icons/dark.svg";
import DragonIcon from "../assets/type_icons/dragon.svg";
import ElectricIcon from "../assets/type_icons/electric.svg";
import FairyIcon from "../assets/type_icons/fairy.svg";
import FightingIcon from "../assets/type_icons/fighting.svg";
import FireIcon from "../assets/type_icons/fire.svg";
import FlyingIcon from "../assets/type_icons/flying.svg";
import GhostIcon from "../assets/type_icons/ghost.svg";
import GrassIcon from "../assets/type_icons/grass.svg";
import GroundIcon from "../assets/type_icons/ground.svg";
import IceIcon from "../assets/type_icons/ice.svg";
import NormalIcon from "../assets/type_icons/normal.svg";
import PoisonIcon from "../assets/type_icons/poison.svg";
import PsychicIcon from "../assets/type_icons/psychic.svg";
import RockIcon from "../assets/type_icons/rock.svg";
import SteelIcon from "../assets/type_icons/steel.svg";
import WaterIcon from "../assets/type_icons/water.svg";

interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: PokemonType[];
}

interface PokemonType {
  type: {
    name: string;
    url: string;
  };
}

const colorsByType = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

const typeIcons: Record<string, ComponentType<SvgProps>> = {
  bug: BugIcon,
  dark: DarkIcon,
  dragon: DragonIcon,
  electric: ElectricIcon,
  fairy: FairyIcon,
  fighting: FightingIcon,
  fire: FireIcon,
  flying: FlyingIcon,
  ghost: GhostIcon,
  grass: GrassIcon,
  ground: GroundIcon,
  ice: IceIcon,
  normal: NormalIcon,
  poison: PoisonIcon,
  psychic: PsychicIcon,
  rock: RockIcon,
  steel: SteelIcon,
  water: WaterIcon,
};

function PokeItem({
  pokemon,
  showRightBorder,
  isPlaceholder,
}: {
  pokemon?: Pokemon | null;
  showRightBorder?: boolean;
  isPlaceholder?: boolean;
}) {
  if (isPlaceholder) {
    return <View style={[styles.cell, showRightBorder && styles.cellBorder]} />;
  }

  if (!pokemon) return null;

  const typeNames = pokemon.types.map((t) => t.type.name);

  return (
    <Link
      href={{ pathname: "/details", params: { name: pokemon.name } }}
      style={[styles.cell, showRightBorder && styles.cellBorder]}
    >
      <View>
        <Text style={styles.id}>{pokemon.id.toString().padStart(4, "0")}</Text>
        <Image
          source={{ uri: pokemon.image }}
          style={{ width: 100, height: 100 }}
        />
        <Text style={styles.name}>{pokemon.name}</Text>
        {typeNames.length > 0 && (
          <View style={styles.typeRow}>
            {typeNames.map((typeName) => {
              const Icon = typeIcons[typeName];
              return (
                Icon && (
                  <View
                    key={typeName}
                    style={[
                      styles.typeBadge,
                      // @ts-ignore
                      { backgroundColor: colorsByType[typeName] ?? "#666666" },
                    ]}
                  >
                    <Icon width={12} height={12} style={styles.typeIcon} />
                  </View>
                )
              );
            })}
          </View>
        )}
      </View>
    </Link>
  );
}

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const params = useLocalSearchParams<{ name?: string }>();

  useEffect(() => {
    if (params.name) {
      fetchPokemons(params.name);
    }
  }, [params.name]);

  async function fetchPokemons(generationName: string) {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/generation/${generationName}/`,
      );
      if (!response.ok) {
        console.log(
          "Failed to fetch generation",
          generationName,
          response.status,
        );
        return;
      }
      const data = await response.json();

      // Fetch detailed info for each pokemon species in this generation in parallel
      const detailedPokemons = await Promise.all(
        data.pokemon_species.map(async (species: any) => {
          try {
            const res = await fetch(
              `https://pokeapi.co/api/v2/pokemon/${species.name}`,
            );
            if (!res.ok) {
              console.log("Failed to fetch pokemon", species.name, res.status);
              return null;
            }
            const details = await res.json();
            return {
              id: details.id,
              name: details.name,
              image: details.sprites.front_default, // main sprite
              types: details.types,
            };
          } catch (error) {
            console.log("Error fetching pokemon", species.name, error);
            return null;
          }
        }),
      );
      // save data in state variable
      setPokemons(
        detailedPokemons
          .filter((pokemon): pokemon is Pokemon => pokemon !== null)
          .sort((a, b) => a.id - b.id),
      );
    } catch (e) {
      console.log(e);
    }
  }
  return (
    <ScrollView contentContainerStyle={styles.pokeGrid}>
      {Array.from({ length: Math.ceil(pokemons.length / 3) }).map(
        (_, rowIndex, rows) => {
          const start = rowIndex * 3;
          const rowItems = pokemons.slice(start, start + 3);
          const rowItemsWithPlaceholders: (Pokemon | null)[] = [...rowItems];

          // pad row to always have 3 cells
          while (rowItemsWithPlaceholders.length < 3) {
            rowItemsWithPlaceholders.push(null);
          }

          const isLastRow = rowIndex === rows.length - 1;

          return (
            <View
              key={rowIndex}
              style={[styles.row, !isLastRow && styles.rowBorder]}
            >
              {rowItemsWithPlaceholders.map((pokemon, columnIndex) => {
                const isLastColumn = columnIndex === 2;
                const key =
                  pokemon?.name ?? `placeholder-${rowIndex}-${columnIndex}`;

                return (
                  <PokeItem
                    key={key}
                    pokemon={pokemon}
                    isPlaceholder={!pokemon}
                    showRightBorder={!isLastColumn}
                  />
                );
              })}
            </View>
          );
        },
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  id: {
    fontSize: 10,
    textAlign: "left",
    color: "gray",
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "capitalize",
  },
  type: {
    fontSize: 6,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    textTransform: "capitalize",
  },
  pokeGrid: {
    borderWidth: 1,
    borderColor: "black",
    flexDirection: "column",
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
    marginTop: 4,
  },
  typeIcon: {
    margin: 0,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 0.2,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
  },
  rowBorder: {
    borderBottomWidth: 0.2,
    borderColor: "grey",
  },
  cell: {
    width: "33.33%", // 3 columns
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cellBorder: {
    borderRightWidth: 0.2,
    borderColor: "grey",
  },
  iconBage: {
    alignSelf: "center",
  },
});
