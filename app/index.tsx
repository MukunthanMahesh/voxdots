import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface Generations {
  name: string;
  regionName: string;
}

const bannersByRegion = {
  kanto: "#A8A77A", // muted olive
  johto: "#6FA8DC", // soft blue
  hoenn: "#F6B26B", // warm orange
  sinnoh: "#8E7CC3", // lavender
  unova: "#93C47D", // fresh green
  kalos: "#E06666", // coral red
  alola: "#FFD966", // sunny yellow
  galar: "#76A5AF", // teal
  paldea: "#C27BA0", // rose
};

export default function Index() {
  const [generations, setGenerations] = useState<Generations[]>([]);

  useEffect(() => {
    // Fetch Generations (GET Endpoint: https://pokeapi.co/api/v2/generation/{id or name}/)
    fetchGenerations();
  }, []);

  async function fetchGenerations() {
    try {
      const response = await fetch("https://pokeapi.co/api/v2/generation/");
      const data = await response.json();

      // Fetch Detailed Information of each Generation in Parallel
      const generationInformation = await Promise.all(
        data.results.map(async (generation: any) => {
          const res = await fetch(generation.url);
          const details = await res.json();
          return {
            name: details.name,
            regionName: details.main_region.name,
          };
        }),
      );

      // Save data in state variable
      setGenerations(generationInformation);
    } catch (e) {
      console.log(e);
    }
  }
  return (
    <ScrollView
      contentContainerStyle={{
        gap: 16,
        padding: 16,
      }}
    >
      {generations.map((generation) => (
        <Link
          key={generation.regionName}
          href={{ pathname: "/region", params: { name: generation.name } }}
          style={{
            // @ts-ignore
            backgroundColor: bannersByRegion[generation.regionName],
            padding: 20,
            borderRadius: 20,
          }}
        >
          <View>
            <Text style={styles.name}>{generation.name}</Text>
          </View>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  type: {
    fontSize: 20,
    fontWeight: "bold",
    color: "gray",
    textAlign: "center",
  },
});
