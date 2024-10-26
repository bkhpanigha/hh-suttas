

export async function fetchAvailableSuttas()
{
    let availableSuttasJson = "FAILED";

    try
    {
        const response = await fetch('python/generated/available_suttas.json');
        const availableSuttas = await response.json();
        availableSuttasJson = availableSuttas['available_suttas'];
    }
    catch(err)
    {
        console.error(`Failed to fetch available suttas: ${err}`)
    }

    return availableSuttasJson;
}