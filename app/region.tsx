import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

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

const icons: Record<string, any> = {
  bug: require("../assets/type_icons/bug.svg"),
  dark: require("../assets/type_icons/dark.svg"),
  dragon: require("../assets/type_icons/dragon.svg"),
  electric: require("../assets/type_icons/electric.svg"),
  fairy: require("../assets/type_icons/fairy.svg"),
  fighting: require("../assets/type_icons/fighting.svg"),
  fire: require("../assets/type_icons/fire.svg"),
  flying: require("../assets/type_icons/flying.svg"),
  ghost: require("../assets/type_icons/ghost.svg"),
  grass: require("../assets/type_icons/grass.svg"),
  ground: require("../assets/type_icons/ground.svg"),
  ice: require("../assets/type_icons/ice.svg"),
  normal: require("../assets/type_icons/normal.svg"),
  poison: require("../assets/type_icons/poison.svg"),
  psychic: require("../assets/type_icons/psychic.svg"),
  rock: require("../assets/type_icons/rock.svg"),
  steel: require("../assets/type_icons/steel.svg"),
  water: require("../assets/type_icons/water.svg"),
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
        <View>
          <Text style={styles.type}>{pokemon.types[0].type.name}</Text>
          <Image source={icons} />
        </View>
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
    fontSize: 10,
    fontWeight: "bold",
    color: "gray",
    textAlign: "center",
    textTransform: "capitalize",
  },
  pokeGrid: {
    borderWidth: 1,
    borderColor: "black",
    flexDirection: "column",
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
