// Import module
import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:url_launcher/url_launcher.dart';

// Fichier annexe
import 'package:easy_management_tw/config.dart';
import 'package:easy_management_tw/login.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _codeController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    // Taille de l'écran
    double screenWidth = MediaQuery.of(context).size.width;
    double screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      // En-tête
      appBar: AppBar(
        title: const Text(
          'Easy Management TW',
          style: TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 4,
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Color.fromARGB(230, 63, 85, 116),
                Color.fromARGB(255, 63, 85, 116),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: const BorderRadius.only(
              bottomLeft: Radius.circular(30),
              bottomRight: Radius.circular(30),
            ),
          ),
        ),
      ),
      backgroundColor: Color.fromARGB(255, 115, 147, 214),
      body: SingleChildScrollView(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              SizedBox(height: screenHeight * 0.05),
              screenWidth > 700
                  ? Row(
                    children: [
                      // Logo à gauche
                      ClipOval(
                        child: Image.asset(
                          'assets/images/Logo_EMTW.webp',
                          width: screenWidth * 0.3,
                          height: screenWidth * 0.3,
                          fit: BoxFit.cover,
                        ),
                      ),
                      // Boîte 1 à droite
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.all(10.0),
                          child: Card(
                            margin: const EdgeInsets.symmetric(
                              horizontal: 20.0,
                              vertical: 10,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                            elevation: 8,
                            color: Color.fromARGB(50, 0, 0, 0),
                            child: Container(
                              constraints: BoxConstraints(
                                minHeight: screenWidth * 0.18,
                              ),
                              padding: const EdgeInsets.all(25.0),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  RichText(
                                    textAlign: TextAlign.center,
                                    text: TextSpan(
                                      style: const TextStyle(
                                        color: Color.fromARGB(
                                          255,
                                          255,
                                          255,
                                          255,
                                        ),
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      children: [
                                        const TextSpan(
                                          text:
                                              'A connection code is required.\n\nYou can retrieve it on Discord with the command "/smartphone".\n\nwebsite : ',
                                        ),
                                        TextSpan(
                                          text: Config.imgUrl,
                                          style: const TextStyle(
                                            color: Colors.blue,
                                            decoration:
                                                TextDecoration.underline,
                                          ),
                                          recognizer:
                                              TapGestureRecognizer()
                                                ..onTap = () async {
                                                  final Uri url = Uri.parse(
                                                    Config.imgUrl,
                                                  );
                                                  if (await canLaunchUrl(url)) {
                                                    await launchUrl(
                                                      url,
                                                      mode:
                                                          LaunchMode
                                                              .externalApplication,
                                                    );
                                                  } else {
                                                    throw 'Impossible d\'ouvrir le lien';
                                                  }
                                                },
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  )
                  : Column(
                    children: [
                      // Logo centré pour les petits écrans
                      ClipOval(
                        child: Image.asset(
                          'assets/images/Logo_EMTW.webp',
                          width: screenWidth * 0.5,
                          height: screenWidth * 0.5,
                          fit: BoxFit.cover,
                        ),
                      ),
                      const SizedBox(height: 3),
                      // Boîte 1 centrée
                      Card(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 20.0,
                          vertical: 10,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        elevation: 8,
                        color: Color.fromARGB(50, 0, 0, 0),
                        child: Padding(
                          padding: const EdgeInsets.all(25.0),
                          child: Column(
                            children: [
                              RichText(
                                textAlign: TextAlign.center,
                                text: TextSpan(
                                  style: const TextStyle(
                                    color: Color.fromARGB(255, 255, 255, 255),
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  children: [
                                    const TextSpan(
                                      text:
                                          'A connection code is required.\n\nYou can retrieve it on Discord with the command "/smartphone".\n\nwebsite : ',
                                    ),
                                    TextSpan(
                                      text: Config.imgUrl,
                                      style: const TextStyle(
                                        color: Colors.blue,
                                        decoration: TextDecoration.underline,
                                      ),
                                      recognizer:
                                          TapGestureRecognizer()
                                            ..onTap = () async {
                                              final Uri url = Uri.parse(
                                                Config.imgUrl,
                                              );
                                              if (await canLaunchUrl(url)) {
                                                await launchUrl(
                                                  url,
                                                  mode:
                                                      LaunchMode
                                                          .externalApplication,
                                                );
                                              } else {
                                                throw 'Impossible d\'ouvrir le lien';
                                              }
                                            },
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
              const SizedBox(height: 1),
              // Boîte 2 centrée
              Card(
                margin: const EdgeInsets.symmetric(
                  horizontal: 20.0,
                  vertical: 10,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                elevation: 8,
                color: Color.fromARGB(50, 0, 0, 0),
                child: Padding(
                  padding: const EdgeInsets.all(25.0),
                  child: Column(
                    children: [
                      TextField(
                        controller: _codeController,
                        decoration: InputDecoration(
                          labelText: 'Connection code',
                          labelStyle: TextStyle(
                            color: Colors.black,
                            fontSize: 16,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(15),
                          ),
                          prefixIcon: Icon(Icons.lock),
                          filled: true,
                          fillColor: Colors.grey[100],
                        ),
                        keyboardType: TextInputType.text,
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: () async {
                          final code = _codeController.text;
                          // envoie du code au serveur
                          await sendCodeToServer(
                            context,
                            code,
                            tofetch: 'login',
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          padding: const EdgeInsets.symmetric(
                            vertical: 15,
                            horizontal: 30,
                          ),
                          elevation: 5,
                        ),
                        child: const Text(
                          'Submit code',
                          style: TextStyle(color: Colors.white, fontSize: 16),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
