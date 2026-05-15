import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useGetOffersQuery, Offer } from "@/profile/profile.api";

export default function Offers() {
  const { data: offers = [], isLoading } = useGetOffersQuery();
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Offers</Text>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color="#21B3A7" />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {offers.length === 0 ? (
            <Text style={styles.empty}>No offers available right now</Text>
          ) : (
            offers.map((offer) => (
              <View key={offer.id} style={styles.card}>
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imageText}>EV Offer</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{offer.title}</Text>
                  <Text style={styles.cardSubtitle}>{offer.subtitle}</Text>
                  <View style={styles.buttonRow}>
                    <Pressable
                      style={styles.secondaryButton}
                      onPress={() => setActiveOffer(offer)}
                    >
                      <Text style={styles.secondaryText}>Details</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal
        visible={!!activeOffer}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveOffer(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setActiveOffer(null)}
        >
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>{activeOffer?.title}</Text>
            <Text style={styles.modalSubtitle}>{activeOffer?.subtitle}</Text>
            <Text style={styles.modalBody}>{activeOffer?.details}</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setActiveOffer(null)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FB",
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  loader: {
    marginTop: 48,
  },
  empty: {
    textAlign: "center",
    color: "#8B97B2",
    marginTop: 32,
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.12)",
    overflow: "hidden",
  },
  imagePlaceholder: {
    height: 160,
    backgroundColor: "#E3EAF5",
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: {
    color: "#6C7CA6",
    fontWeight: "600",
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#13233D",
  },
  cardSubtitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#6C7CA6",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#21B3A7",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginRight: 10,
  },
  secondaryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F6A6A",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#13233D",
  },
  modalSubtitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#6C7CA6",
  },
  modalBody: {
    marginTop: 12,
    fontSize: 13,
    color: "#1A2850",
    fontWeight: "600",
    lineHeight: 18,
  },
  modalButton: {
    marginTop: 16,
    alignSelf: "flex-end",
    backgroundColor: "#21B3A7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
