const StarNotary = artifacts.require('StarNotary')

var accounts
var owner

contract('StarNotary', (accs) => {
  accounts = accs
  owner = accounts[0]
})

it('can Create a Star', async () => {
  let tokenId = 1
  let instance = await StarNotary.deployed()
  await instance.createStar('Awesome Star!', tokenId, { from: accounts[0] })
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
})

it('lets user1 put up their star for sale', async () => {
  let instance = await StarNotary.deployed()
  let user1 = accounts[1]
  let starId = 2
  let starPrice = web3.utils.toWei('.01', 'ether')
  await instance.createStar('awesome star', starId, { from: user1 })
  await instance.putStarUpForSale(starId, starPrice, { from: user1 })
  assert.equal(await instance.starsForSale.call(starId), starPrice)
})

it('lets user1 get the funds after the sale', async () => {
  let instance = await StarNotary.deployed()
  let user1 = accounts[1]
  let user2 = accounts[2]
  let starId = 3
  let starPrice = web3.utils.toWei('.01', 'ether')
  let balance = web3.utils.toWei('.05', 'ether')
  await instance.createStar('awesome star', starId, { from: user1 })
  await instance.putStarUpForSale(starId, starPrice, { from: user1 })
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1)
  await instance.buyStar(starId, { from: user2, value: balance })
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1)
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice)
  let value2 = Number(balanceOfUser1AfterTransaction)
  assert.equal(value1, value2)
})

it('lets user2 buy a star, if it is put up for sale', async () => {
  let instance = await StarNotary.deployed()
  let user1 = accounts[1]
  let user2 = accounts[2]
  let starId = 4
  let starPrice = web3.utils.toWei('.01', 'ether')
  let balance = web3.utils.toWei('.05', 'ether')
  await instance.createStar('awesome star', starId, { from: user1 })
  await instance.putStarUpForSale(starId, starPrice, { from: user1 })
  await instance.buyStar(starId, { from: user2, value: balance })
  assert.equal(await instance.ownerOf.call(starId), user2)
})

it('lets user2 buy a star and decreases its balance in ether', async () => {
  let instance = await StarNotary.deployed()
  let user1 = accounts[1]
  let user2 = accounts[2]
  let starId = 5
  let starPrice = web3.utils.toWei('.01', 'ether')
  let balance = web3.utils.toWei('.05', 'ether')
  await instance.createStar('awesome star', starId, { from: user1 })
  await instance.putStarUpForSale(starId, starPrice, { from: user1 })
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2)
  await instance.buyStar(starId, { from: user2, value: balance })
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2)
  let value =
    Number(balanceOfUser2BeforeTransaction) + Number(balanceAfterUser2BuysStar)
  assert.equal(value > starPrice, true)
})

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async () => {
  // 1. create a Star with different tokenId
  //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
  const instance = await StarNotary.deployed()
  const user1 = accounts[1]
  const starId = 111
  await instance.createStar('Yassin Star', starId, { from: user1 })
  const name = await instance.name.call()
  const symbol = await instance.symbol.call()
  assert.equal(name, 'Star Notary Token')
  assert.equal(symbol, 'SNT')
})

it('lets 2 users exchange stars', async () => {
  const instance = await StarNotary.deployed()
  const starToken1 = 20
  const starToken2 = 25
  const user1 = accounts[0]
  const user2 = accounts[1]
  await instance.createStar('owned by user1', starToken1, { from: user1 })
  await instance.createStar('owned by user2', starToken2, { from: user2 })

  // before exchange
  assert.equal(user1, await instance.ownerOf(starToken1))
  assert.equal(user2, await instance.ownerOf(starToken2))

  await instance.exchangeStars(starToken1, starToken2, { from: user1 })

  // after exchange
  assert.equal(user1, await instance.ownerOf(starToken2))
  assert.equal(user2, await instance.ownerOf(starToken1))
})

it('lets a user transfer a star', async () => {
  // 1. create a Star with different tokenId
  // 2. use the transferStar function implemented in the Smart Contract
  // 3. Verify the star owner changed.
  const instance = await StarNotary.deployed()
  const tokenId = 55
  const user1 = accounts[0]
  const user2 = accounts[1]
  await instance.createStar('owned by user1', tokenId, { from: user1 })

  // before transfer
  assert.equal(user1, await instance.ownerOf(tokenId))

  await instance.transferStar(user2, tokenId)

  // after transfer
  assert.equal(user2, await instance.ownerOf(tokenId))
})

it('lookUptokenIdToStarInfo test', async () => {
  // 1. create a Star with different tokenId
  // 2. Call your method lookUptokenIdToStarInfo
  // 3. Verify if you Star name is the same

  const instance = await StarNotary.deployed()
  const tokenId = 100
  const user1 = accounts[0]
  await instance.createStar('owned by user1', tokenId, { from: user1 })

  assert.equal(
    await instance.lookUptokenIdToStarInfo(tokenId),
    'owned by user1',
  )
})
