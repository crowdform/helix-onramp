import "./styles.css";
import { Spinner } from "@chakra-ui/react";
import {
  Card,
  Heading,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Flex,
  Box
} from "@chakra-ui/react";

import Torus from "@toruslabs/torus-embed";

import { useEffect, useState } from "react";

const torus = new Torus();

function removeEmpty(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
}

export default function App() {
  const [init, setInit] = useState(false);
  const [defaults, setDefaults] = useState({});
  useEffect(() => {
    const init = async () => {
      await torus.init({ network: { host: "matic" }, showTorusButton: false });
      setInit(true);

      // get url params
      if (typeof window !== "undefined") {
        const queryString = window.location.search || {};
        const urlParams = new URLSearchParams(queryString);
        const selectedAddress = urlParams.get("selectedAddress");
        const fiatValue = urlParams.get("fiatValue");
        const selectedCurrency = urlParams.get("selectedCurrency");
        setDefaults(
          removeEmpty({
            selectedAddress,
            fiatValue,
            selectedCurrency
          })
        );
      }

      //
      return null;
    };
    init();
  }, []);
  const handleTopup = async (provider, opts = {}) => {
    console.log("supportNetworkTokens", provider, { ...defaults, ...opts });
    try {
      // await torus.login();
      const paymentStatus = await torus.initiateTopup(provider, {
        selectedCurrency: "USD",
        fiatValue: 60.0,
        chainNetwork: "matic",
        ...defaults,
        ...opts
      });
      console.log("paymentStatus", paymentStatus);
    } catch (e) {
      console.error(e);
    }
  };

  if (!init) {
    return (
      <Flex height="100vh" justifyContent="center" alignContent="center">
        <Spinner />
      </Flex>
    );
  }
  return (
    <div className="App">
      <Flex justifyContent="center">
        <Box maxW="400px">
          <Heading my="20px" size="md">
            Helix OnRamp USDC WIP
          </Heading>

          {Object.keys(torus.paymentProviders).map((network) => {
            const provider = torus.paymentProviders[network];

            if (network == "transak") {
              return null;
            }

            console.log("provider", provider);
            const supportNetworkTokens =
              provider.validCryptoCurrenciesByChain?.["matic"];

            const USDCCompatible =
              supportNetworkTokens &&
              supportNetworkTokens.find((i) => i.display === "USDC");

            if (USDCCompatible?.display) {
              return (
                <Card key={network} mb="20px">
                  <CardHeader>
                    <Heading size="md">{network}</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text
                      dangerouslySetInnerHTML={{ __html: provider.line1 }}
                    />
                    <Text
                      dangerouslySetInnerHTML={{ __html: provider.line2 }}
                    />
                    <Text
                      dangerouslySetInnerHTML={{ __html: provider.line3 }}
                    />
                  </CardBody>
                  <CardFooter>
                    <Flex justifyContent="center" alignContent="center">
                      <button
                        className="button_provider"
                        onClick={() =>
                          handleTopup(network, {
                            selectedCryptoCurrency: USDCCompatible.value
                          })
                        }
                      >
                        Topup {USDCCompatible.display} on {network}
                      </button>
                    </Flex>
                  </CardFooter>
                </Card>
              );
            }
          })}
        </Box>
      </Flex>
    </div>
  );
}
