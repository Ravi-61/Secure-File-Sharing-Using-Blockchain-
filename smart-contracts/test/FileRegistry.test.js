const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FileRegistry Smart Contract Test Suite", function () {
  let fileRegistry;
  let owner;
  let user1;
  let user2;

  const sampleFileHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const sampleCid = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
  const sampleFileName = "test_document.pdf";
  const sampleFileSize = 1024;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const FileRegistryFactory = await ethers.getContractFactory("FileRegistry");
    fileRegistry = await FileRegistryFactory.deploy();
    await fileRegistry.waitForDeployment();
  });

  it("Should register a new file and emit FileRegistered event", async function () {
    await expect(
      fileRegistry
        .connect(owner)
        .registerFile(sampleFileHash, sampleCid, sampleFileName, sampleFileSize)
    )
      .to.emit(fileRegistry, "FileRegistered")
      .withArgs(
        sampleFileHash,
        sampleFileHash,
        sampleCid,
        owner.address,
        await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1),
        sampleFileName
      );

    const verification = await fileRegistry.verifyFile(sampleFileHash);
    expect(verification.isAuthentic).to.be.true;
    expect(verification.ipfsCid).to.equal(sampleCid);
    expect(verification.owner).to.equal(owner.address);
    expect(verification.fileName).to.equal(sampleFileName);
  });

  it("Should prevent duplicate file registration", async function () {
    await fileRegistry
      .connect(owner)
      .registerFile(sampleFileHash, sampleCid, sampleFileName, sampleFileSize);

    await expect(
      fileRegistry
        .connect(owner)
        .registerFile(sampleFileHash, sampleCid, sampleFileName, sampleFileSize)
    ).to.be.revertedWith("FileRegistry: File already registered");
  });

  it("Should allow granting and revoking access permissions", async function () {
    await fileRegistry
      .connect(owner)
      .registerFile(sampleFileHash, sampleCid, sampleFileName, sampleFileSize);

    expect(await fileRegistry.hasAccess(sampleFileHash, user1.address)).to.be.false;

    await fileRegistry.connect(owner).grantAccess(sampleFileHash, user1.address);
    expect(await fileRegistry.hasAccess(sampleFileHash, user1.address)).to.be.true;

    await fileRegistry.connect(owner).revokeAccess(sampleFileHash, user1.address);
    expect(await fileRegistry.hasAccess(sampleFileHash, user1.address)).to.be.false;
  });

  it("Should allow ownership transfer to a new address", async function () {
    await fileRegistry
      .connect(owner)
      .registerFile(sampleFileHash, sampleCid, sampleFileName, sampleFileSize);

    await fileRegistry.connect(owner).transferOwnership(sampleFileHash, user1.address);

    const verification = await fileRegistry.verifyFile(sampleFileHash);
    expect(verification.owner).to.equal(user1.address);
  });
});
