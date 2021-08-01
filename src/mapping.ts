import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { ETHBurned } from "../generated/schema"

let EIGHTEEN_DECIMALS = BigInt.fromI32(10).pow(18).toBigDecimal()

export function handleBlock(block: ethereum.Block): void {
  let entity = ETHBurned.load('1')
  if (!entity) {
    entity = new ETHBurned('1')
    entity.burned = BigInt.fromI32(0).toBigDecimal()
  }

  if (block.baseFeePerGas != null) {
    let baseFee = block.baseFeePerGas as BigInt
    let burned = (block.gasUsed.times(baseFee)).divDecimal(EIGHTEEN_DECIMALS)
    entity.burned += burned

    entity.save();
  }
}
