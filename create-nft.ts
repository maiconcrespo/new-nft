import {
  createNft,
  fetchAllDigitalAsset,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";

// Crear nueva conexion
const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile(); // si no definimos que archivo usar , el default es el id.json que tenemos en usuario
//añadimos un airdrop de SOL si no tenemos.
await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.5 * LAMPORTS_PER_SOL
);

console.log("Loaded user", user.publicKey.toBase58());

//creamos una instancia de UMI asi podemos llamar a tools de metaplex, y definimos UMI para usar nuestro usuario. como default para cualquier transacion.
const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata()); // mplTokenMetadata es una funcion entonces vamos ejecutar mplTokenMetadata.
//hacemos una version de umi keypair, umi tiene su proprio formato para keypairs

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey); //apenas copia el usuario, pero es el formato que usa umi para las secretkeys
umi.use(keypairIdentity(umiUser));
//Metaplex tiene su propria manera de hacer las cosas. Puede ser un poco diferente da manera normal de Web3.js que estamos usando

console.log("Set up Umi instance for user");

// Obtener la direcion de mi coleccion de NFTs
const collectionAdress = publicKey("My ColectionAdrress from url");

//Crear el NFT
console.log(`creating NFT...`);

//El NFT tiene su proprio mint, cada uno tiene su Address
const mint = generateSigner(umi);

const transacion = await createNft(umi, {
  mint,
  name: "My NFT",
  uri: "https://...",
  sellerFeeBasisPoints: percentAmount(0),
  collection: {
    key: collectionAdress,
    verified: false, //False porque cuando creamos primero definimos como false, y en el segunda etapa iremos sign o verify que es parte de nuestra collection
    //y cambiamos el verified para true.
  },
});

await transacion.sendAndConfirm(umi); //asi enviamos la transacion y mandamos todo para umi haga el trabajo por nosotros.

//Recuperamos el NFT creado
const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

console.log(
  `CreatedNFT! Adress  is ${getExplorerLink(
    "address",
    createdNft.mint.publicKey,
    "devnet"
  )}`
);
