namespace Lucrai.Core.Services;

public static class ValorPorExtensoHelper
{
    private static readonly string[] Unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    private static readonly string[] Dezenas = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    private static readonly string[] Centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

    private static string ConverterCentena(long n)
    {
        if (n == 0) return "";
        if (n == 100) return "cem";
        var c = n / 100;
        var d = (n % 100) / 10;
        var u = n % 10;
        var result = Centenas[c];
        var resto = n % 100;
        if (resto == 0) return result;
        if (c > 0) result += " e ";
        if (resto >= 11 && resto <= 19)
        {
            result += resto switch
            {
                11 => "onze", 12 => "doze", 13 => "treze", 14 => "quatorze",
                15 => "quinze", 16 => "dezesseis", 17 => "dezessete",
                18 => "dezoito", 19 => "dezenove",
                _ => ""
            };
        }
        else
        {
            if (d > 0)
            {
                result += Dezenas[d];
                if (u > 0) result += " e ";
            }
            if (u > 0) result += Unidades[u];
        }
        return result;
    }

    public static string Converter(decimal valor)
    {
        if (valor < 0) return "";

        var reais = (long)Math.Floor(valor);
        var centavos = (int)Math.Round((valor - (decimal)reais) * 100);

        if (reais == 0 && centavos == 0) return "Zero Reais";

        string reaisText = "";

        if (reais > 0)
        {
            var bilhoes = reais / 1_000_000_000;
            var restoAposBilhao = reais % 1_000_000_000;
            var milhoes = restoAposBilhao / 1_000_000;
            var restoAposMilhao = restoAposBilhao % 1_000_000;
            var milhares = restoAposMilhao / 1_000;
            var unidades = restoAposMilhao % 1_000;

            var partes = new List<string>();

            if (bilhoes > 0)
            {
                if (bilhoes == 1)
                    partes.Add("um bilhão");
                else
                    partes.Add(ConverterCentena(bilhoes) + " bilhões");
            }
            if (milhoes > 0)
            {
                if (milhoes == 1)
                    partes.Add("um milhão");
                else
                    partes.Add(ConverterCentena(milhoes) + " milhões");
            }
            if (milhares > 0)
            {
                if (milhares == 1)
                    partes.Add("mil");
                else
                    partes.Add(ConverterCentena(milhares) + " mil");
            }
            if (unidades > 0)
            {
                partes.Add(ConverterCentena(unidades));
            }

            var reaisTextJoined = string.Join(", ", partes);
            var ultimo = partes.LastOrDefault() ?? "";
            var usaDe = ultimo.EndsWith("milhão") || ultimo.EndsWith("milhões") ||
                        ultimo.EndsWith("bilhão") || ultimo.EndsWith("bilhões");

            reaisText = reaisTextJoined + (usaDe ? " de" : "") + (reais == 1 ? " Real" : " Reais");
        }

        if (centavos > 0)
        {
            var cText = ConverterCentena(centavos);
            var centavosText = cText + (centavos == 1 ? " Centavo" : " Centavos");

            if (reais > 0)
                return Capitalizar(reaisText + " e " + centavosText);

            return Capitalizar(centavosText);
        }

        return Capitalizar(reaisText);
    }

    private static string Capitalizar(string texto)
    {
        if (string.IsNullOrEmpty(texto)) return texto;
        return char.ToUpper(texto[0]) + texto[1..];
    }
}
