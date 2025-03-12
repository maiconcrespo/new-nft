import { createNft,fetchAllDigitalAsset,fetchDigitalAsset,mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired,getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {clusterApiUrl, Connection, LAMPORTS_PER_SOL} from "@solana/web3.js"
import{generateSigner, keypairIdentity, percentAmount} from "@metaplex-foundation/umi"


// Crear nueva conexion
const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile(); // si no definimos que archivo usar , el default es el id.json que tenemos en usuario
//añadimos un airdrop de SOL si no tenemos.
await airdropIfRequired(connection,user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5* LAMPORTS_PER_SOL);

console.log("Loaded user",user.publicKey.toBase58());

//creamos una instancia de UMI asi podemos llamar a tools de metaplex, y definimos UMI para usar nuestro usuario. como default para cualquier transacion.
const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata()) // mplTokenMetadata es una funcion entonces vamos ejecutar mplTokenMetadata.
//hacemos una version de umi keypair, umi tiene su proprio formato para keypairs

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey); //apenas copia el usuario, pero es el formato que usa umi para las secretkeys
umi.use(keypairIdentity(umiUser));
//Metaplex tiene su propria manera de hacer las cosas. Puede ser un poco diferente da manera normal de Web3.js que estamos usando

console.log("Set up Umi instance for user");



//CREAMOS COLLECTION MINT

const collectionMint= generateSigner(umi);

const transacion = await createNft(umi,{
    mint:collectionMint,
    name:"My Collection",
    symbol:"MC",
    uri:"https://...", //TODO create json file in descentralizade as final, befor use github ,{name:, description:, image:"url"}
    sellerFeeBasisPoints: percentAmount(0),
    isCollection:true //sellerfee es para los artistas receberen en el mercado secundario-un Royaly de cada transacion futura.
    //  Pero acutalmente hay alternativas como NFTs programables, transfer hooks, que pueden ser utilizados como mecanismo para los artistas obtenerens
    //royalties. Y los usuarios pueden transferir sin tener que pagar os artistas originales.Podemos estudiar Token Extensions ha muchas cosas buenas alla.
});
await transacion.sendAndConfirm(umi);

// Fetch the NFT que acabamos de crear.
const createdCollectionNft = await fetchDigitalAsset(umi, collectionMint.publicKey);

console.log(`Created Collection BOX! Addres is ${getExplorerLink("address",createdCollectionNft.mint.publicKey,"devnet")}`)








