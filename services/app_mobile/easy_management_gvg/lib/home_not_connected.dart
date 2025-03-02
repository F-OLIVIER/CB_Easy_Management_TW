// Import module
import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:url_launcher/url_launcher.dart';

// Fichier annexe
import 'package:easy_management_gvg/login.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _codeController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    // Obtenir la largeur de l'écran
    double screenWidth = MediaQuery.of(context).size.width;
    double containerWidth = screenWidth * 0.5;

    return Scaffold(
      // En-tête
      appBar: AppBar(
        title: const Text(
          'Easy Management GvG',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        backgroundColor: Color.fromARGB(153, 0, 0, 0),
      ),
      backgroundColor: Color.fromARGB(255, 115, 147, 214),
      body: SingleChildScrollView(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              const SizedBox(height: 2),
              ClipOval(
                child: Image.asset(
                  'assets/images/Logo_EMGVG.webp',
                  width: containerWidth,
                  height: containerWidth,
                  fit: BoxFit.cover,
                ),
              ),

              const SizedBox(height: 3),

              // Boîte 1 : instruction + lien de récupération du code de connexion
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
                  padding: const EdgeInsets.all(10.0),
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
                              text: 'http://easymanagergvg.fr',
                              style: const TextStyle(
                                color: Colors.blue,
                                decoration: TextDecoration.underline,
                              ),
                              recognizer:
                                  TapGestureRecognizer()
                                    ..onTap = () async {
                                      final Uri url = Uri.parse(
                                        'https://easymanagergvg.fr',
                                      );
                                      if (await canLaunchUrl(url)) {
                                        await launchUrl(
                                          url,
                                          mode: LaunchMode.externalApplication,
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

              const SizedBox(height: 1),

              // Boîte 2 : Saisie du code
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
                  padding: const EdgeInsets.all(15.0),
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
                          // print('Code de connexion: $code');
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
