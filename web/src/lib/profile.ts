export function cleanPublicName(value: string) {
  return value.replace(/^[ \t\n\r\f\v]+|[ \t\n\r\f\v]+$/g, '').normalize('NFC');
}
export function validPublicName(value: string) {
  return [...value].length >= 1 && [...value].length <= 80 && !/[@\x00-\x1f\x7f]/.test(value);
}
export function validGeoGuessrUrl(value: string) {
  return value === '' || /^https:\/\/(www\.)?geoguessr\.com\/user\/[A-Za-z0-9_-]{1,100}\/?$/.test(value);
}
export const nameHelp = 'Use de 1 a 80 caracteres, sem e-mail. Maiúsculas e minúsculas não diferenciam nomes.';
export const urlHelp = 'Use https://www.geoguessr.com/user/seu-id, sem parâmetros. Deixe vazio para remover.';
