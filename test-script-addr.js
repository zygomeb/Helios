#!/usr/bin/env nodejs

import * as helios from "./helios.js";


const cborHex1 = "4d01000033222220051200120011";
//const cborHex = "581358110100002223333573464945262498992601";

let cborBytes1 = helios.hexToBytes(cborHex1);

cborBytes1.unshift(1);

console.log(cborBytes1);

let hash = helios.Crypto.blake2b(cborBytes1, 28);

console.log(helios.bytesToHex(hash))

let addr = helios.Crypto.encodeBech32("addr_test", [0x70].concat(hash));

console.log(addr);

const cborHex2 = "5905d15905ce01000032323232323232323232323232323232323232323222333357346464646666ae68cc058c054004cc04922120047311fde3f1281fd08956918e3d37f883930836db4d8f2a75b640bbf76f582700480008cc02cc02800ccc024cc020c01c011241054d794e4654004800892824c6664446660060060040024446666ae68d5d18011311999ab9a3371000490001311999ab9a3370e006900011aba100523330060063574400a66e04011200249926498c05800520003016001001249899262323333573466e1cd55ce800a400046ae84d55cf0011180b99b964912762616420636f6e73747220666f72204d696e74696e672c2077616e7420302062757420676f742000301635573a004931baa323333573466e1cd55ce800a400046ae84d5d11aab9e00226498dd50009119ba548000cc038008dd49b98001223322374c66ae80cdd80011ba633574066ec0004dd40019bb2498dd924c646666ae68cdc39aab9d001480008d5d09aab9e00226498dd5001191999ab9a3370e6aae7400520002357426ae88d55cf0011324c6ea80088c8cccd5cd19b8735573a002900011aba1357446ae88d5d11aab9e002230143372c92012962616420636f6e73747220666f722054782e4d696e7465642c2077616e7420302062757420676f742000301335573a004931baa00122332232330010013300900300222333357346ae8c0049289191999ab9a300f330093300b0060013300b00500124a046600a00a6ae8801126375c6ae840092637560046eac00488c8cc004004cc01800c00888cccd5cd1aba300124a24646666ae68c030cdc39980380300099803802800925023300500535744008931bae357420049311191998008008018011111999ab9a357460044900011999ab9a3371e6eb8d55ce9aba10030022375a6aae78d5d080211998028029aba20040034992622323300100100322333357346ae8c0048dd924c46666ae68cdc79bae35573a6ae840080108dd59aab9e357420064660080086ae8800d2649888c8c8ccc00400400800c888cccd5cd1aba30012003232333357346601400c002466600c00c00a6ae880108cd5d01ba900233300600600535744008931bae35573a6ae840092630030022323300100100222333357346ae8c0048dd8a4c466ae80d55ce9aba1002330030033574400493111919800800801911999ab9a3574600249408cccd5cd19b8f375c6ae840080109289198020021aba20034992623335734002941289119ba548000cc00ccdd2a400060086ea4008dd40009119aba00023357400026ec52623357400026ec5262323333573466e1cd55ce800a400046ae84d55cf0011180419b964913262616420636f6e73747220666f72205478496e7075742e54784f757470757449642c2077616e7420302062757420676f742000300735573a004931baa001223333573466e3cdd7191999ab9a3370e6aae7400520002357426aae7800899263754646666ae68cdc39aab9d001480008d5d09aab9e00226498dd50011bae323333573466e1cd55ce800a400046ae84d55cf0011324c6ea8c8cccd5cd19b8735573a002900011aba135573c0044c931baa00123370e6eb4c8cccd5cd19b8735573a002900011aba1357446aae78008992637540066eb4c8cccd5cd19b8735573a002900011aba1357446aae780089926375400449412623758646666ae68cdc39aab9d001480008d5d09aab9e002230063372c9212b62616420636f6e73747220666f722054782e7478496e707574732c2077616e7420302062757420676f742000300535573a004931baa0012323333573466e1cd55ce800a400046ae84d55cf0011180299b964913062616420636f6e73747220666f7220536372697074436f6e746578742e54782c2077616e7420302062757420676f742000300435573a004931baa00123732646666ae68cdc400124000466e2d205a33002002337040069001919801001001a4c44646666ae68cdc4001240284004466e28cc010010cdc1801a40280049319b8b3370066e18005201448181220100233357380024c931";


let cborBytes2 = helios.unwrapCborBytes(helios.hexToBytes(cborHex2));

cborBytes2.unshift(1);

console.log(helios.bytesToHex(helios.Crypto.blake2b(cborBytes2, 28)));
