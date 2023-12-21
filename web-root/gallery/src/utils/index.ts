import ExifReader from "exifreader";

export function decodeShutterSpeed(s: number): string
{
    if (s < 0)
    {
        return `1/${Math.abs(s)}`;
    }
    else
    {
        return s.toString()
    }
}

export function encodeShutterSpeed(s: string): number
{
    if (s.startsWith("1/"))
        return -Number(s.substring(2));
    return Number(s);
}

export function parseExifRational(rational: ExifReader.RationalTag | null, defaultValue: number, fractions?: number)
{
    let value: number;
    if (rational)
    {
        value = rational.value[0] / rational.value[1];
    }
    else
    {
        value = defaultValue;
    }
    return value;
}