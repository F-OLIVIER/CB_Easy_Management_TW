// Import
import 'package:flutter/material.dart';

// Fichiers annexes

void showSuccessNotification(BuildContext context, String message,
    {Duration duration = const Duration(seconds: 4)}) {
  final snackBar = SnackBar(
    content: Row(
      children: [
        Icon(Icons.check_circle, color: Colors.white),
        SizedBox(width: 8),
        Expanded(
            child: Text(message,
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white))),
      ],
    ),
    duration: duration,
    backgroundColor: Colors.green,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    behavior: SnackBarBehavior.floating,
    elevation: 6,
    margin: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
  );

  if (context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }
}

void showErrorNotification(BuildContext context, String message,
    {Duration duration = const Duration(seconds: 4)}) {
  final snackBar = SnackBar(
    content: Row(
      children: [
        Icon(Icons.cancel, color: Colors.white),
        SizedBox(width: 8),
        Expanded(
            child: Text(message,
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white))),
      ],
    ),
    duration: duration,
    backgroundColor: Colors.red,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    behavior: SnackBarBehavior.floating,
    elevation: 6,
    margin: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
  );

  if (context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }
}
