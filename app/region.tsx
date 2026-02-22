import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

interface Pokemon {
  id: number;
  name: string;
  image: string;
  // imageBack: string;
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

function PokeItem({ pokemon }: { pokemon: Pokemon }) {
  return (
    <Link
      href={{ pathname: "/details", params: { name: pokemon.name } }}
      style={[
        {
          // @ts-ignore
          backgroundColor: colorsByType[pokemon.types[0].type.name] + 50,
        },
        styles.pokeCell,
      ]}
    >
      <View>
        <Text style={styles.name}>{pokemon.name}</Text>
        <Text style={styles.type}>{pokemon.types[0].type.name}</Text>
        <Image
          source={{ uri: pokemon.image }}
          style={{ width: 100, height: 100 }}
        />
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
              // imageBack: details.sprites.back_default,
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
      {pokemons.map((pokemon) => (
        <PokeItem key={pokemon.name} pokemon={pokemon} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  type: {
    fontSize: 10,
    fontWeight: "bold",
    color: "gray",
    textAlign: "center",
  },
  pokeGrid: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  pokeCell: {
    width: "32%", // ~3 columns
    padding: 8,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
});
