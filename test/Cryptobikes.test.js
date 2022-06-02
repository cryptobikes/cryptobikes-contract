const { expect } = require("chai");

const { expectRevert } = require("@openzeppelin/test-helpers");

const Cryptobikes = artifacts.require("Cryptobikes");

let cryptobikes;

function delay(seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

const wallets = [
  {
    address: "0xaEB5fd256f83378B1200c71301aE4f992b171CAB",
    name: "advisor",
    months: 36,
    supplyMonth: "222222000000000000000000",
  },
  {
    address: "0xa5415323154118b66f9941Ad6ED1fC827f5887f1",
    name: "core team",
    months: 36,
    supplyMonth: "333333000000000000000000",
  },
  {
    address: "0xB5BddeCF0cb7646bfaC19Cc85645da49861bd27a",
    name: "marketing",
    months: 12,
    supplyMonth: "500000000000000000000000",
  },
  {
    address: "0x9241587cF95B939B660ba2c4153030Cc8e53257c",
    name: "development",
    months: 12,
    supplyMonth: "750000000000000000000000",
  },
  {
    address: "0xABD5023E47bD60b8356B308131869Aa350689bd3",
    name: "private sale",
    months: 0,
    supplyMonth: 0,
  },
  {
    address: "0x27366d85d97089dFB6b3A95e5cC1038821ef5DE1",
    name: "dex liquidity",
    months: 0,
    supplyMonth: 0,
  },
  {
    address: "0x29dAB46C36BBe7a450B1607AA17fcCFA41bAF190",
    name: "play to earn",
    months: 0,
    supplyMonth: 0,
  },
];

let advisor;
let coreTeam;
let marketing;
let development;
let privateSale;
let dexLiquidity;
let playToEarn;

contract(
  "Cryptobikes",
  ([
    advisorAddress,
    coreTeamAddress,
    marketingAddress,
    developmentAddress,
    privateSaleAddress,
    dexLiquidityAddress,
    playToEarnAddress,
    anonymousOne,
    anonymousTwo,
    anonymousThree,
  ]) => {
    beforeEach(async () => {
      advisor = wallets.find((wallet) => wallet.name === "advisor");
      advisor.address = advisorAddress;

      coreTeam = wallets.find((wallet) => wallet.name === "core team");
      coreTeam.address = coreTeamAddress;

      marketing = wallets.find((wallet) => wallet.name === "marketing");
      marketing.address = marketingAddress;

      development = wallets.find((wallet) => wallet.name === "development");
      development.address = developmentAddress;

      privateSale = wallets.find((wallet) => wallet.name === "private sale");
      privateSale.address = privateSaleAddress;

      dexLiquidity = wallets.find((wallet) => wallet.name === "dex liquidity");
      dexLiquidity.address = dexLiquidityAddress;

      playToEarn = wallets.find((wallet) => wallet.name === "play to earn");
      playToEarn.address = playToEarnAddress;

      cryptobikes = await Cryptobikes.new(
        advisor.address,
        coreTeam.address,
        marketing.address,
        development.address,
        privateSale.address,
        dexLiquidity.address,
        playToEarn.address,
        { from: playToEarnAddress, gas: "4000000" }
      );
    });

    it("should deploy a contract", async () => {
      expect(cryptobikes.address).to.not.be.null;

      const name = await cryptobikes.name();
      const symbol = await cryptobikes.symbol();
      const decimals = await cryptobikes.decimals();
      const totalSupply = await cryptobikes.totalSupply();

      expect(name).to.equal("Cryptobikes");
      expect(symbol).to.equal("CTB");
      expect(decimals.toString()).to.equal("18");
      expect(totalSupply.toString()).to.equal("100000000000000000000000000");
    });

    it("the advisor wallet must have the correct balance", async () => {
      const balance = await cryptobikes.balanceOf(advisor.address);
      expect(balance.toString()).to.equal("8000000000000000000000000");
    });

    it("the core team wallet must have the correct balance", async () => {
      const balance = await cryptobikes.balanceOf(coreTeam.address);
      expect(balance.toString()).to.equal("12000000000000000000000000");
    });

    it("the marketing wallet must have the correct balance", async () => {
      const balance = await cryptobikes.balanceOf(marketing.address);
      expect(balance.toString()).to.equal("6000000000000000000000000");
    });

    it("the development wallet must have the correct balance", async () => {
      const balance = await cryptobikes.balanceOf(development.address);
      expect(balance.toString()).to.equal("9000000000000000000000000");
    });

    it("the private sale wallet must have the correct balance", async () => {
      const balance = await cryptobikes.balanceOf(privateSale.address);
      expect(balance.toString()).to.equal("5000000000000000000000000");
    });

    it("the dex liquidity wallet must have the correct balance", async () => {
      const balance = await cryptobikes.balanceOf(dexLiquidity.address);
      expect(balance.toString()).to.equal("7000000000000000000000000");
    });

    it("the play to earn wallet must have the correct balance", async () => {
      const balance = await cryptobikes.balanceOf(playToEarn.address);
      expect(balance.toString()).to.equal("53000000000000000000000000");
    });

    it("the wallet must be able to transfer while it has a balance", async () => {
      const amount = "10000000000000000000";

      const testWallets = [anonymousOne, anonymousTwo, anonymousThree];

      for (let i = 0; i < 40; i++) {
        const account =
          testWallets[Math.floor(Math.random() * testWallets.length)];
        await cryptobikes.transfer(account, amount, {
          from: dexLiquidity.address,
          gas: "3000000",
        });
      }

      const balance = await cryptobikes.balanceOf(dexLiquidity.address);
      expect(balance.toString()).to.equal("6999600000000000000000000");
    });

    it("advisor must be able to transfer only the stipulated amount per month", async () => {
      const to = anonymousOne;
      const amount = advisor.supplyMonth;

      await delay(1.6);

      await cryptobikes.transfer(to, amount, {
        from: advisor.address,
        gas: "3000000",
      });

      const balance = await cryptobikes.balanceOf(advisor.address);
      expect(balance.toString()).to.equal("7777778000000000000000000");
    });

    it("core team must be able to transfer only the stipulated amount per month", async () => {
      const to = anonymousOne;
      const amount = coreTeam.supplyMonth;

      await delay(1.6);

      await cryptobikes.transfer(to, amount, {
        from: coreTeam.address,
        gas: "3000000",
      });

      const balance = await cryptobikes.balanceOf(coreTeam.address);
      expect(balance.toString()).to.equal("11666667000000000000000000");
    });

    it("marketing must be able to transfer only the stipulated amount per month", async () => {
      const to = anonymousOne;
      const amount = marketing.supplyMonth;

      await delay(1.6);

      await cryptobikes.transfer(to, amount, {
        from: marketing.address,
        gas: "3000000",
      });

      const balance = await cryptobikes.balanceOf(marketing.address);
      expect(balance.toString()).to.equal("5500000000000000000000000");
    });

    it("development must be able to transfer only the stipulated amount per month", async () => {
      const to = anonymousOne;
      const amount = development.supplyMonth;

      await delay(1.6);

      await cryptobikes.transfer(to, amount, {
        from: development.address,
        gas: "3000000",
      });

      const balance = await cryptobikes.balanceOf(development.address);
      expect(balance.toString()).to.equal("8250000000000000000000000");
    });

    it("the private sale wallet must be able to freely transfer", async () => {
      const amount = "500000000000000000000000";

      await cryptobikes.transfer(anonymousOne, amount, {
        from: privateSale.address,
        gas: "3000000",
      });

      await cryptobikes.transfer(anonymousTwo, amount, {
        from: privateSale.address,
        gas: "3000000",
      });

      await cryptobikes.transfer(anonymousThree, amount, {
        from: privateSale.address,
        gas: "3000000",
      });

      const balance = await cryptobikes.balanceOf(privateSale.address);
      expect(balance.toString()).to.equal("3500000000000000000000000");
    });

    it("marked tokens can be transferred to the game", async () => {
      const account = anonymousOne;
      const amount = "500000000000000000000000";

      await cryptobikes.transfer(account, amount, {
        from: privateSale.address,
        gas: "3000000",
      });

      await cryptobikes.transfer(account, amount, {
        from: privateSale.address,
        gas: "3000000",
      });

      await cryptobikes.transfer(playToEarn.address, amount, {
        from: account,
        gas: "3000000",
      });

      await cryptobikes.transfer(playToEarn.address, amount, {
        from: account,
        gas: "3000000",
      });

      const balance = await cryptobikes.balanceOf(account);
      expect(balance.toString()).to.equal("0");
    });

    it("should not be possible to transfer marked tokens to a different wallet than the game", async () => {
      const amount = "500000000000000000000000";

      await cryptobikes.transfer(anonymousOne, amount, {
        from: privateSale.address,
        gas: "3000000",
      });

      await expectRevert(
        cryptobikes.transfer(anonymousTwo, amount, {
          from: anonymousOne,
          gas: "3000000",
        }),
        "Permission denied, marked tokens."
      );
    });

    it("unmarked tokens can be transferred", async () => {
      const amount = "500000000000000000000000";

      await cryptobikes.transfer(anonymousOne, amount, {
        from: privateSale.address,
        gas: "3000000",
      });

      await cryptobikes.transfer(anonymousOne, amount, {
        from: playToEarn.address,
        gas: "3000000",
      });

      await cryptobikes.transfer(anonymousTwo, amount, {
        from: anonymousOne,
        gas: "3000000",
      });

      const balance = await cryptobikes.balanceOf(anonymousOne);

      expect(balance.toString()).to.equal(amount);
    });

    it("marked tokens cannot be transferred together with unmarked tokens", async () => {
      const amount = "500000000000000000000000";

      await cryptobikes.transfer(anonymousOne, amount, {
        from: privateSale.address,
        gas: "3000000",
      });

      await cryptobikes.transfer(anonymousOne, amount, {
        from: playToEarn.address,
        gas: "3000000",
      });

      await expectRevert(
        cryptobikes.transfer(anonymousTwo, "500000000000000000000001", {
          from: anonymousOne,
          gas: "3000000",
        }),
        "Permission denied, marked tokens."
      );
    });
  }
);
