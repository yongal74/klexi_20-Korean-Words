#!/bin/bash
export EXPO_TOKEN=I6SAyWJxaUOhmCD0KI_TPChf89WyZ4MndyGaVkVk
export EAS_BUILD_NO_EXPO_GO_WARNING=true
npx eas-cli build --platform android --profile production
