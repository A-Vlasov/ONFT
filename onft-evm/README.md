### ONFT (LayerZero v2, EVM) — старт проекта

Этот проект — заготовка под стандартный ONFT на LayerZero v2 (OApp) для EVM‑сетей (например, Ethereum/Abstract).

Документация:
- [LayerZero V2 ONFT Quickstart](https://docs.layerzero.network/v2/developers/evm/onft/quickstart)
- [OApp Overview](https://docs.layerzero.network/v2/developers/evm/oapp/overview)

#### 1) Предварительные требования
- Node.js ≥ 18, npm
- Кошелёк с тестовыми токенами в выбранных testnet (напр. Sepolia/Abstract)

#### 2) Генерация OApp проекта (CLI)
Рекомендуемый путь — использовать официальный генератор:

```bash
npx create-lz-oapp@latest
```

В мастере выберите ONFT (ONFT721) как стартовый шаблон. После генерации у вас будут:
- контракты ONFT (burn/mint) и/или Adapter (lock/mint)
- скрипты деплоя и «вайринга» (wire) пиров
- `layerzero.config.ts` для конфигурации сетей/EID

Альтернатива: можно начать с чистого Hardhat и добавить OApp вручную, но CLI быстрее и безопаснее.

#### 3) Деплой контрактов
Из сгенерированного проекта:

```bash
npx hardhat lz:deploy
```

Выберите нужные сети (например, Sepolia и Abstract testnet). Дождитесь адресов развернутых контрактов ONFT/Adapter.

Альтернатива (Remix):
- Для назначения (например, Abstract) задеплойте `contracts/MyONFT721.sol` с параметрами `(name, symbol, lzEndpoint, delegate)`.
- Для источника (Ethereum) задеплойте `contracts/MyONFT721Adapter.sol` с параметрами `(existingErc721, lzEndpoint, delegate)`.
- Адреса Endpoint V2 берите из документации LZ v2 для соответствующих сетей.

#### 4) Настройка пиров (peers) и параметров безопасности
«Провайдить» связи между контрактами на сетях можно CLI‑командой:

```bash
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

Проверка корректности wiring и конфигурации:

```bash
npx hardhat lz:oapp:peers:get --oapp-config layerzero.config.ts
npx hardhat lz:oapp:config:get:default
npx hardhat lz:oapp:config:get
```

Обязательно проверьте EID сетей, DVN/Executor конфиги и лимиты газа (enforced options), как описано в доках.

#### 5) Отправка NFT между сетями
В ONFT (burn/mint) токен на источнике сжигается, на назначении — минтится. В Adapter (lock/mint) — на источнике лочится в контракте, на назначении — минт/анлок. Пример отправки через Adapter описан в Quickstart, см. разделы «ONFT Adapter» и примеры `quote/send`.

Ключевые моменты:
- payload содержит `to (bytes32)` и `tokenId` (uint256)
- на приёме контракт вызывает `_credit(to, tokenId, srcEid)`; для совпадения ID выполняется `_mint(to, tokenId)` (если ещё не существует) или `transfer` из эскроу

#### 6) Совпадение tokenId на ETH/Abstract
Для одинаковых tokenId:
- передавайте `tokenId` в payload (LZ v2)
- на целевой сети минтите ровно этот `tokenId` (контракт должен поддерживать `_safeMint(to, tokenId)` без автоинкремента)
- для Adapter — при первом заходе выполните «ленивый» `mint` в эскроу, далее используйте lock/unlock

#### 7) Безопасность
- Настраивайте только доверенные `peers` (адреса OApp на других сетях)
- Используйте несколько DVN в проде
- Следите за лимитами газа в `enforced options` и таймаутами/retry

Полные инструкции и примеры — в официальных гайдах:
- ONFT Quickstart: https://docs.layerzero.network/v2/developers/evm/onft/quickstart
- OApp Overview: https://docs.layerzero.network/v2/developers/evm/oapp/overview


