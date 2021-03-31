export function parseName(input:string):string{
  input = input.replace(`\\`,`\\\\`)
  input = input.replace(`*`,`\\*`)
  input = input.replace(`_`,`\\_`)
  input = input.replace(`|`,`\\|`)
  return input
}