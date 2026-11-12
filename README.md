# ApiMeteo — versão refeita (React + CSS)

Esta versão funciona sem Java, Maven ou backend próprio. O navegador consulta diretamente a API pública Open-Meteo.

## Requisitos
- Node.js 18 ou superior: https://nodejs.org/
- VS Code (opcional)

## Executar no Windows
1. Extraia o ZIP.
2. Abra a pasta `ApiMeteo-Refeito` no VS Code.
3. Abra o terminal com `Ctrl + J`.
4. Execute, um comando por vez:

```bash
npm install
npm run dev
```

5. Abra o endereço mostrado no terminal, normalmente http://localhost:5173.

## Funcionalidades
- Busca de cidades.
- Condições atuais, sensação térmica, umidade e vento.
- Previsão horária e de cinco dias.
- Tema visual dinâmico conforme a condição meteorológica.
- Globo ilustrativo em CSS e animação de chuva.
- Tratamento de erros e tela de fallback para erros inesperados do React.

## Observação
O globo é uma ilustração decorativa, não um globo real do Google Earth. Os dados são fornecidos pela Open-Meteo: https://open-meteo.com/.
