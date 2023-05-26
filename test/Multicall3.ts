import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Interface } from 'ethers'

const Web3EthAbi = require('web3-eth-abi');
const { padLeft, web3 } = require('web3-utils');

const WTON_ABI = require("../abis/WTON.json");

import * as dotenv from "dotenv";

// rest of imports omitted

dotenv.config();

// const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;
// if (!MAINNET_RPC_URL) throw new Error('Please set the MAINNET_RPC_URL environment variable.');
// const provider = new JsonRpcProvider("https://goerli.infura.io/v3/086aad6219cf436eb12e2ceae00e3b29");

describe("Multicall3", function () {
  let richAccount = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea";
  let testAccount : any

  let Multicall3: any
  let MultiCont: any

  let wtonContract: any

  let wtonAddress = "0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6";
  const ensRegistryInterface = new Interface(['function resolver(bytes32) view returns (address)']);
  const wtonInterface = new Interface(['function swapToTON(uint256) returns (bool)']);
  console.log(wtonInterface)

  // let amount = ethers.utils.parseUnits("1", 27);
  let amount = 100000000

  const calls = [ 
    {
      target: wtonAddress,
      allowFailure: true, // We allow failure for all calls.
      callData: wtonInterface.encodeFunctionData('swapToTON', [amount]),
    }
  ]
  

  before("account setting",async () => {
    testAccount = await ethers.getSigner(richAccount)
    await ethers.provider.send("hardhat_impersonateAccount",[richAccount]);
    await ethers.provider.send("hardhat_setBalance", [
      richAccount,
      "0x8ac7230489e80000",
    ]);
})

  describe("Deployment", function () {
    it("Set the Mullticall3", async () => {
      Multicall3 = await ethers.getContractFactory("Multicall3");
      MultiCont = await Multicall3.deploy();
    })

    it("set wton", async () => {
      wtonContract = new ethers.Contract(wtonAddress, WTON_ABI.abi, provider );
    })
  });

  describe("Multicall Test", function () {
    it("multiCall WTON -> TON", async () => {
      let beforeWTON = await wtonContract.balanceOf(testAccount.address)
      await MultiCont.connect(testAccount).aggregate3(calls);
      let afterWTON = await wtonContract.balanceOf(testAccount.address)
      expect(afterWTON).to.be.gt(beforeWTON);
    })
  });
});
