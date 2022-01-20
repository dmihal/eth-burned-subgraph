import { Address, BigInt, BigDecimal, ethereum } from "@graphprotocol/graph-ts"
import { ETHBurned } from "../generated/schema"
import { Chainlink } from "../generated/ETHBurned/Chainlink"

let EIGHTEEN_DECIMALS = BigInt.fromI32(10).pow(18).toBigDecimal()
let EIGHT_DECIMALS = BigInt.fromI32(10).pow(8).toBigDecimal()

function getETHPrice(): BigDecimal {
  let chainlink = Chainlink.bind(Address.fromString('0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419'))
  return chainlink.latestAnswer().divDecimal(EIGHT_DECIMALS)
}

export function handleBlock(block: ethereum.Block): void {
  let entity = ETHBurned.load('1')
  if (!entity) {
    entity = new ETHBurned('1')
    entity.burned = BigInt.fromI32(0).toBigDecimal()
    entity.burnedUSD = BigInt.fromI32(0).toBigDecimal()
  }

  if (block.baseFeePerGas > BigInt.fromI32(0)) {
    let baseFee = block.baseFeePerGas as BigInt
    let burned = (block.gasUsed.times(baseFee)).divDecimal(EIGHTEEN_DECIMALS)

    // There's a weird bug on block 14001535, where the USD price is massive, so we'll hardcode it
    let ethPrice = block.number.toI32() === 14001535
      ? BigDecimal.fromString("3282.81450911")
      : getETHPrice()

    entity.burned += burned
    entity.burnedUSD += burned * ethPrice

    entity.save();
  }
}
