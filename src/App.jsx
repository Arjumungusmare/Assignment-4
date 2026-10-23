import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
async function fetchCryptoPrices() {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin&vs_currencies=usd"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch crypto prices");
  }

  return response.json();
}

let savedFavorites = [];

async function fetchFavorites() {
  return [...savedFavorites];
}

async function saveFavorite(coin) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!savedFavorites.includes(coin)) {
    savedFavorites.push(coin);
  }

  return coin;
}

function App() {
  const queryClient = useQueryClient();
  const {data: prices, isPending, isError, error,} = useQuery({
    queryKey: ["cryptoPrices"],
    queryFn: fetchCryptoPrices,
    refetchInterval: 10000,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
  });

  const favoriteMutation = useMutation({
    mutationFn: saveFavorite,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["favorites"],
      });
    },
  });

  const coins = [
    { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
    { id: "ethereum", name: "Ethereum", symbol: "ETH" },
    { id: "dogecoin", name: "Dogecoin", symbol: "DOGE" },
  ];

  if (isPending) {
    return <h2>Loading crypto prices...</h2>;
  }

  if (isError) {
    return (
      <div>
        <h2>Something went wrong!</h2>
        <p>{error.message}</p>
        <button
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["cryptoPrices"],
            })
          }
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="container">
      <h1>Crypto Dashboard</h1>
      <p className="subtitle">
        Live cryptocurrency prices in USD
      </p>

      <section className="coin-grid">
        {coins.map((coin) => (
          <div className="coin-card" key={coin.id}>
            <h2>{coin.name}</h2>
            <p className="symbol">{coin.symbol}</p>

            <h3>
              ${prices[coin.id]?.usd?.toLocaleString("en-US")}
            </h3>

            <button
              onClick={() => favoriteMutation.mutate(coin.id)}
              disabled={
                favoriteMutation.isPending ||
                favorites.includes(coin.id)
              }
            >
              {favorites.includes(coin.id)
                ? "★ Favorited"
                : favoriteMutation.isPending
                  ? "Saving..."
                  : "☆ Add Favorite"}
            </button>
          </div>
        ))}
      </section>

      <p className="refresh-note">
        Prices refresh automatically every 10 seconds.
      </p>
    </main>
  );
}
export default App;

