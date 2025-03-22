// Import module
import 'package:flutter/material.dart';
import 'dart:async';

// Fichier annexe
import 'package:easy_management_tw/config.dart';
import 'package:easy_management_tw/common_custom_app.dart';
import 'package:easy_management_tw/fetch_server.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  HomePageState createState() => HomePageState();
}

class HomePageState extends State<HomePage> {
  int? etatInscripted;
  String housename = "Easy Manager GvG";

  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  Future<void> _initializeData() async {
    try {
      // Récupération des données
      final userData = await fetchData(tofetch: 'user');
      // print('---------------------------------');
      // print('userData : $userData');
      // print("Gestion : ${userData['Gestion']}");
      // print("UserInfo : ${userData['UserInfo']}");
      // print("House : ${userData['House']}");
      // print('---------------------------------');

      if (userData['Internet'] != null && userData['Internet'] == false) {
        if (mounted) {
          Navigator.pushReplacementNamed(context, '/no_internet');
        }
        return;
      }

      if (userData['Gestion']['Logged'] == false && mounted) {
        logout(context);
      }

      setState(() {
        if (userData['Gestion']['BotActivate']) {
          etatInscripted = userData['UserInfo']?['EtatInscription'];
        } else {
          etatInscripted = 5;
        }
        housename = userData['House'][0]['House_name'];
        Config.codeApp = userData['UserInfo']['CodeApp'];
        Config.language = userData['UserInfo']['Language'];
      });
    } catch (e) {
      // print("Erreur lors de la récupération des données : $e");
    }
  }

  Future<String?> showCustomDialog(BuildContext context) async {
    return await showDialog<String>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          contentPadding: EdgeInsets.symmetric(horizontal: 4, vertical: 30),
          title: Center(
            child: Text(
              Config.language == "fr"
                  ? "Sélectionner votre statut"
                  : "Select your statut",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          content: Text(
            Config.language == "fr"
                ? "Voulez-vous vous inscrire comme présent ou absent ?"
                : "Do you want to register as present or absent?",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16),
          ),
          actionsAlignment: MainAxisAlignment.center,
          actions: [
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              onPressed: () => Navigator.pop(context, "present"),
              icon: const Icon(
                Icons.check_circle,
                size: 14,
                color: Colors.white,
              ),
              label: const Text("Present"),
            ),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              onPressed: () => Navigator.pop(context, "absent"),
              icon: const Icon(Icons.cancel, size: 14, color: Colors.white),
              label: const Text("Absent"),
            ),
          ],
        );
      },
    );
  }

  // Fonction pour gérer le clic sur le gros bouton
  void _handleBigButtonClick(BuildContext context) async {
    if (etatInscripted != 5) {
      int newetat = 0;
      if (etatInscripted == 0 || etatInscripted == -1) {
        // popup pour choisir entre présent ou absent
        String? choix = await showCustomDialog(context);

        if (choix == "present") {
          newetat = 1;
          // print("Inscrit présent !");
        } else if (choix == "absent") {
          newetat = 3;
          // print("Inscrit absent !");
        }
      } else if (etatInscripted == 1) {
        newetat = 3;
        // print("Changé à absent !");
      } else if (etatInscripted == 3) {
        newetat = 1;
        // print("Changé à présent !");
      }

      if (newetat != etatInscripted) {
        Map<String, dynamic> dataToSend = {
          'EtatInscription': newetat,
          'CodeApp': Config.codeApp,
        };
        await sendDataToServer(
          adresstosend: 'updateinscription',
          data: dataToSend,
        );

        setState(() {
          etatInscripted = newetat;
        });
      }
    }
  }

  // Fonction pour obtenir la couleur en fonction de l'etat d'inscription
  Map<String, dynamic> _getButtonAppearance() {
    if (etatInscripted == 0 || etatInscripted == -1) {
      return {
        "color": Colors.orange,
        "text": Config.language == "fr" ? "Non inscrit" : "Not inscripted",
      };
    } else if (etatInscripted == 1) {
      return {
        "color": Colors.green,
        "text":
            Config.language == "fr" ? "Inscrit présent" : "Registered present",
      };
    } else if (etatInscripted == 3) {
      return {
        "color": Colors.red,
        "text":
            Config.language == "fr" ? "Inscrit absent" : "Registered absent",
      };
    } else if (etatInscripted == 5) {
      return {
        "color": Colors.grey,
        "text":
            Config.language == "fr"
                ? "Pas besoin d'inscription"
                : "No need inscription",
      };
    }
    return {
      "color": Colors.grey,
      "text": Config.language == "fr" ? "Erreur" : "Error",
    };
  }

  @override
  Widget build(BuildContext context) {
    final buttonAppearance = _getButtonAppearance();

    return Scaffold(
      appBar: customAppBar(context, title: housename),
      drawer: customAppDrawer(context),
      backgroundColor: Color.fromARGB(255, 115, 147, 214),
      body: Center(
        child: LayoutBuilder(
          builder: (context, constraints) {
            // Calculer 60 % de la largeur de l'écran
            double buttonSize = constraints.maxWidth * 0.6;

            return Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  Config.language == "fr"
                      ? "Etat de votre inscription"
                      : "Status of your registration",
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 1.2,
                    shadows: [
                      Shadow(
                        offset: Offset(1.0, 1.0),
                        blurRadius: 4.0,
                        color: Colors.black,
                      ),
                    ],
                  ),
                ),
                Text(
                  Config.language == "fr"
                      ? "(cliquer dessus pour modifier)"
                      : "(click to modify)",
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.white,
                    letterSpacing: 1.2,
                    shadows: [
                      Shadow(
                        offset: Offset(1.0, 1.0),
                        blurRadius: 4.0,
                        color: Colors.black,
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 40),
                Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: buttonAppearance["color"],
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(150),
                        offset: Offset(0, 8),
                        blurRadius: 20,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: () => _handleBigButtonClick(context),
                    style: ElevatedButton.styleFrom(
                      shape: const CircleBorder(),
                      backgroundColor: buttonAppearance["color"],
                      padding: EdgeInsets.zero,
                      elevation: 0,
                    ),
                    child: SizedBox(
                      width: buttonSize,
                      height: buttonSize,
                      child: Center(
                        child: Text(
                          buttonAppearance["text"],
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            shadows: [
                              Shadow(
                                offset: Offset(2.0, 2.0),
                                blurRadius: 5.0,
                                color: Color.fromARGB(100, 0, 0, 0),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
