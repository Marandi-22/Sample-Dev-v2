import React from "react";
import { View } from "react-native";
import { Card, Text, Button, Avatar } from "react-native-paper";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "expo-router";

export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <View style={{ padding:16 }}>
      <Card>
        <Card.Title title="Profile" left={(p)=><Avatar.Icon {...p} icon="account" />} />
        <Card.Content>
          <Text variant="titleMedium">{user?.name}</Text>
          <Text>{user?.email}</Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={async () => { await signOut(); router.replace("/login"); }}>
            Logout
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
}
