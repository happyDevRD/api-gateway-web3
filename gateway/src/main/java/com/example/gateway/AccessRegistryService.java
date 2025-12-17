package com.example.gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Bool;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.http.HttpService;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class AccessRegistryService {

    @Value("${contract.rpc}")
    private String rpcUrl;

    @Value("${contract.address}")
    private String contractAddress;

    private Web3j web3j;

    @PostConstruct
    public void init() {
        web3j = Web3j.build(new HttpService(rpcUrl));
    }

    public CompletableFuture<Boolean> hasAccess(String userAddress) {
        Function function = new Function(
                "hasAccess",
                Arrays.asList(new Address(userAddress)),
                Arrays.asList(new TypeReference<Bool>() {
                }));

        String encodedFunction = FunctionEncoder.encode(function);

        Transaction transaction = Transaction.createEthCallTransaction(
                userAddress, contractAddress, encodedFunction);

        return web3j.ethCall(transaction, DefaultBlockParameterName.LATEST)
                .sendAsync()
                .thenApply(ethCall -> {
                    if (ethCall.hasError()) {
                        System.err.println("Web3j Error: " + ethCall.getError().getMessage());
                        return false;
                    }
                    List<Type> result = FunctionReturnDecoder.decode(
                            ethCall.getValue(), function.getOutputParameters());
                    if (result.isEmpty())
                        return false;
                    return (boolean) result.get(0).getValue();
                });
    }
}
