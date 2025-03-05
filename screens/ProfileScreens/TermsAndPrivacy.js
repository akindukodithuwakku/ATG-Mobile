import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const SectionCard = ({ title, children }) => {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
};

const BulletPoint = ({ bold, children }) => {
  return (
    <View style={styles.bulletPointContainer}>
      <Text style={styles.bulletSymbol}>•</Text>
      <Text style={styles.bulletText}>
        {bold && <Text style={styles.boldText}>{bold}: </Text>}
        {children}
      </Text>
    </View>
  );
};

const TermsAndPrivacy = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={["#09D1C7", "#35AFEA"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Privacy and Terms</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.contentContainer}>
        <View>
          <Text style={styles.mainTopic}>Privacy Policy</Text>
          <SectionCard title="1. Introduction">
            <Text style={styles.sectionText}>
              Welcome to ATG Healthcare. This Privacy Policy explains how we
              collect, use, and protect your personal information when you use
              our healthcare management application.
            </Text>
          </SectionCard>

          <SectionCard title="2. Data We Collect">
            <Text style={styles.sectionText}>
              We collect the following types of data:
            </Text>
            <BulletPoint bold="Personal Information">
              Name, contact details, profile information.
            </BulletPoint>
            <BulletPoint bold="Health-Related Data">
              Care plans, medication history, appointment details.
            </BulletPoint>
            <BulletPoint bold="Usage Data">
              Device information, interactions with the app.
            </BulletPoint>
          </SectionCard>

          <SectionCard title="3. How We Use Your Data">
            <Text style={styles.sectionText}>We use your data to:</Text>
            <BulletPoint>
              Facilitate care plan and medication management.
            </BulletPoint>
            <BulletPoint>Schedule and manage appointments.</BulletPoint>
            <BulletPoint>
              Enhance app security and user authentication.
            </BulletPoint>
            <BulletPoint>
              Improve user experience and app functionality.
            </BulletPoint>
          </SectionCard>

          <SectionCard title="4. Data Sharing">
            <Text style={styles.sectionText}>
              Your data may be shared with:
            </Text>
            <BulletPoint bold="Healthcare Providers">
              To provide medical guidance.
            </BulletPoint>
            <BulletPoint bold="AWS Cognito">
              For secure authentication and access management.
            </BulletPoint>
            <BulletPoint bold="Third-Party Integrations">
              Such as Calendly for appointment scheduling.
            </BulletPoint>
          </SectionCard>

          <SectionCard title="5. Your Rights">
            <BulletPoint bold="Access & Update">
              You can view and update your profile details.
            </BulletPoint>
            <BulletPoint bold="Deletion">
              Request deletion of your account and associated data.
            </BulletPoint>
            <BulletPoint bold="Opt-out">
              You can opt out of non-essential data collection.
            </BulletPoint>
          </SectionCard>

          <SectionCard title="6. Data Security">
            <Text style={styles.sectionText}>
              We implement strong encryption, access controls, and secure
              authentication mechanisms to protect your data.
            </Text>
          </SectionCard>

          <SectionCard title="7. Policy Updates">
            <Text style={styles.sectionText}>
              We may update this Privacy Policy, and changes will be
              communicated within the app.
            </Text>
          </SectionCard>

          <Text style={styles.mainTopic}>Terms</Text>
          <SectionCard title="1. Introduction">
            <Text style={styles.sectionText}>
              These Terms of Use govern your access and use of ATG Healthcare's
              mobile application. By using the app, you agree to abide by these
              terms.
            </Text>
          </SectionCard>

          <SectionCard title="2. User Responsibilities">
            <BulletPoint>
              You must provide{" "}
              <Text style={styles.boldText}>accurate and complete</Text>{" "}
              information.
            </BulletPoint>
            <BulletPoint>
              The app is for{" "}
              <Text style={styles.boldText}>
                personal healthcare management only
              </Text>
              .
            </BulletPoint>
            <BulletPoint>
              You are responsible for keeping your account and login credentials
              secure.
            </BulletPoint>
          </SectionCard>

          <SectionCard title="3. Limitations of Use">
            <BulletPoint>
              You must <Text style={styles.boldText}>not misuse</Text> the app
              or attempt unauthorized access.
            </BulletPoint>
            <BulletPoint>
              The app{" "}
              <Text style={styles.boldText}>
                does not provide medical advice
              </Text>
              —always consult a licensed professional.
            </BulletPoint>
            <BulletPoint>
              We reserve the right to{" "}
              <Text style={styles.boldText}>suspend or terminate</Text> accounts
              that violate our policies.
            </BulletPoint>
          </SectionCard>

          <SectionCard title="4. Intellectual Property">
            <Text style={styles.sectionText}>
              All content, logos, and trademarks in the app belong to ATG
              Healthcare and cannot be used without permission.
            </Text>
          </SectionCard>

          <SectionCard title="5. Disclaimers & Liability">
            <BulletPoint>
              The app provides{" "}
              <Text style={styles.boldText}>healthcare management tools</Text>{" "}
              but does not replace professional medical care.
            </BulletPoint>
            <BulletPoint>
              We are <Text style={styles.boldText}>not liable</Text> for any
              loss or misuse of data due to user negligence.
            </BulletPoint>
          </SectionCard>

          <SectionCard title="6. Modifications & Updates">
            <Text style={styles.sectionText}>
              We may update these terms periodically, and continued use of the
              app constitutes agreement to the changes.
            </Text>
          </SectionCard>

          <SectionCard title="7. Contact Information">
            <Text style={styles.sectionText}>
              For any questions, contact us at support@atghealthcare.com
            </Text>
          </SectionCard>
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  backButton: {
    padding: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 30,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  mainTopic: {
    fontSize: 18,
    fontWeight: "bold",
    paddingBottom: 8,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPointContainer: {
    flexDirection: "row",
    paddingLeft: 2,
    marginBottom: 8,
  },
  bulletSymbol: {
    fontSize: 15,
    color: "#09D1C7",
    marginRight: 8,
    width: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  boldText: {
    fontWeight: "bold",
    color: "#333",
  },
  bottomPadding: {
    height: 24,
  },
});

export default TermsAndPrivacy;
