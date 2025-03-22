// Import module
import 'dart:io';
import 'package:flutter/material.dart';

// Fichier annexe
import 'package:easy_management_tw/no_internet.dart';
import 'package:easy_management_tw/home_not_connected.dart';
import 'package:easy_management_tw/login.dart';
import 'package:easy_management_tw/setting.dart';
import 'package:easy_management_tw/storage.dart';
import 'package:easy_management_tw/notification.dart';
import 'package:easy_management_tw/home_connected.dart';
import 'package:easy_management_tw/caserne.dart';
import 'package:easy_management_tw/character_card.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Easy Management TW',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color.fromARGB(255, 252, 110, 110),
        ),
        useMaterial3: true,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const SplashScreen(),
        '/login': (context) => const LoginPage(),
        '/home': (context) => const HomePage(),
        '/caserne': (context) => const Caserne(),
        '/fichepersonnage': (context) => const FichePersonnagePage(),
        '/no_internet': (context) => const NoInternetPage(),
        '/setting': (context) => const Setting(),
      },
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    try {
      File file = await getLocalFile();
      bool fileExists = await file.exists();
      Map<String, bool>? result;

      if (fileExists) {
        final data = await readJson();
        if (mounted) {
          // Vérification du code d'autorisation
          result = await sendCodeToServer(
            context,
            data['UserInfo']['CodeApp'],
            tofetch: 'user',
          );
        }

        if (result != null && result['Internet'] == false) {
          if (mounted) {
            Navigator.pushReplacementNamed(context, '/no_internet');
          }
          return;
        }

        // Traitement des informations
        if (result != null && result['Logged'] == true) {
          // Code valide, utilisateur connecté => Redirection vers la page principale
          if (mounted) {
            Navigator.pushReplacementNamed(context, '/home');
          }
          return;
        } else {
          // Code NON valide, utilisateur NON connecté => Redirection vers la page de connexion
          if (mounted) {
            Navigator.pushReplacementNamed(context, '/login');
          }
          return;
        }
      } else {
        if (mounted) {
          Navigator.pushReplacementNamed(context, '/login');
        }
        return;
      }
    } catch (e) {
      // print('Error during login check: $e');
      if (mounted) {
        showErrorNotification(context, 'Erreur interne');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: CircularProgressIndicator()));
  }
}
