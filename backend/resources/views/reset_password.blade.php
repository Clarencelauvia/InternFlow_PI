<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Réinitialisation de mot de passe - InternFlow</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f0fdf4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 50px auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #16a34a, #059669); padding: 30px; text-align: center; color: white; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; border-radius: 30px; text-decoration: none; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>InternFlow</h1>
            <p>Réinitialisation de mot de passe</p>
        </div>
        <div class="content">
            <h2>Bonjour {{ $name }},</h2>
            <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte InternFlow.</p>
            
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            
            <div style="text-align: center;">
                <a href="{{ url('/reset-password?token=' . $token . '&email=' . $email) }}" class="button">Réinitialiser mon mot de passe</a>
            </div>
            
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="background: #f3f4f6; padding: 10px; border-radius: 8px; word-break: break-all;">
                {{ url('/reset-password?token=' . $token . '&email=' . $email) }}
            </p>
            
            <p>Ce lien est valable pendant 60 minutes.</p>
            
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} InternFlow. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>