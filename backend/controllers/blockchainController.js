const blockchainService = require("../services/blockchainService");

const getWalletNonce = async (req, res) => {
  try {
    const { walletAddress } = req.query;
    if (!walletAddress) {
      return res.status(400).json({ message: "Wallet address required" });
    }

    const nonce = blockchainService.generateNonce(walletAddress);
    return res.status(200).json({ nonce });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to generate nonce" });
  }
};

const registerOnChain = async (req, res) => {
  try {
    const { fileId, txHash, walletAddress } = req.body;

    if (!fileId || !txHash) {
      return res.status(400).json({ message: "fileId and txHash are required" });
    }

    const updatedFile = await blockchainService.recordOnChainRegistration(
      fileId,
      txHash,
      walletAddress || req.user?.walletAddress || "Web3 User",
      req.user?._id
    );

    return res.status(200).json({
      message: "File registration logged on blockchain successfully",
      file: updatedFile,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to log on-chain registration" });
  }
};

const verifyOnChain = async (req, res) => {
  try {
    const { fileHash } = req.params;
    const result = await blockchainService.verifyOnChainFile(fileHash);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify file on-chain" });
  }
};

module.exports = {
  getWalletNonce,
  registerOnChain,
  verifyOnChain,
};
