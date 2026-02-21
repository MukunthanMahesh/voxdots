import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function Details() {
  const params = useLocalSearchParams();

  useEffect(() => {
    fetchPokemonByName();
  }, []);

  async function fetchPokemonByName(name: string) {
    try {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon" + params,
      );
      const data = await response.json();
    } catch (e) {
      console.log(e);
    }
  }

  console.log(params);
  return (
    <ScrollView
      contentContainerStyle={{
        gap: 16,
        padding: 16,
      }}
    ></ScrollView>
  );
}

const styles = StyleSheet.create({});
