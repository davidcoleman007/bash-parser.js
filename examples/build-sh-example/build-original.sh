#!/bin/bash -e
# -e to exit on first error.

# This script is responsible for building the project's static content.
# It is also responsible for running code coverage (i.e. SonarQube).
#
# Developers are free to alter the build process, even significantly, as long
# as they ensure:
# - Their build produces a dist folder
# - Their entry point asset exists at the top of dist
# - All child assets are placed in dist/__VERSION__
#
# They also must acknowledge that at deploy time:
# - The string __VERSION__ will be replaced in all of their assets with a
#   string unique to the deployment
# - The contents of the dist/__VERSION__ folder will be deployed to a new
#   subfolder of dist in the S3 bucket named using that same unique string
# - Any files under dist/__VERSION__ will be assigned a long cache time
#   (default 1 day). All other files will be assigned a short cache time
#   (default 1 minute).

if [[ -n "$ARTIFACTORY_USER" ]]; then
    # Get "email" and "_auth" values from Artifactory for .npmrc file.
    # Assumption: ARTIFACTORY_USER and ARTIFACTORY_API_TOKEN need to have
    # already been defined in the environment.
    auth=$(curl -s -u$ARTIFACTORY_USER:$ARTIFACTORY_API_TOKEN https://artifactory.corp.adobe.com/artifactory/api/npm/auth)
else
    # If missing $ARTIFACTORY_USER, try the user-level .npmrc file.
    auth=$(<~/.npmrc)
fi
[[ "$auth" =~ email\ *=\ *([[:graph:]]*) ]]; export NPM_EMAIL="${BASH_REMATCH[1]}"
[[ "$auth" =~ _auth\ *=\ *([[:graph:]]*) ]]; export NPM_AUTH="${BASH_REMATCH[1]}"

# The following code is a workaround for the problem of auto-increment-version
# and check-published-artifact utilities, which are using an NPM library called
# npm-utils that does not handle the environment variable reference expressions
# like ${NPM_AUTH} in .npmrc file.
echo "Copying .npmrc to .npmrc.copy"
cp .npmrc .npmrc.copy
echo "Replacing _auth and email in .npmrc"
egrep -v '_auth|email' .npmrc.copy > .npmrc
cat >> .npmrc << EOF
//artifactory.corp.adobe.com/artifactory/api/npm/npm-dcloud/:_auth=$NPM_AUTH
//artifactory.corp.adobe.com/artifactory/api/npm/npm-react-release/:_auth=$NPM_AUTH
//artifactory.corp.adobe.com/artifactory/api/npm/npm-spectrum-release/:_auth=$NPM_AUTH
email=$NPM_EMAIL
legacy-peer-deps=true
EOF

# It is assumed that the build result being deployed to S3/CDN will be stored
# in the "dist" folder, and if you want to publish an NPM package to the
# Artifactory, it will be stored in the "dist-pub" folder.
rm -rf dist
mkdir dist
npm install

# If this is an ephemeral deployment build, overwrite package.json version with EPHEMERAL_ARTIFACT_VERSION
if [[ "$BUILD_TYPE" == "deploy-ephemeral" ]]; then
  npx write-version -v "$EPHEMERAL_ARTIFACT_VERSION"
else
  npx auto-increment-version
fi
npm run build
npx map-source-usages
npx map-io-usages
npx rollup-pageobjects
npx rollup-uitests --batchSize=10 --debug

if [[ "$BUILD_TYPE" != "deploy-ephemeral" ]]; then
  npm run test
fi
npm run bundle:aggregation

# SonarQube analysis
if [ -n "$SONAR_TOKEN" ]; then
    echo "SONAR_TOKEN found. Running SonarQube analysis with SONAR_ANALYSIS_TYPE=$SONAR_ANALYSIS_TYPE"

    if [ -z "$sha" ]; then
        echo "Error: sha is required for SonarQube analysis"
        exit 1
    fi

    ############# TODO - Add SonarQube analysis here #############
fi

# Publish an NPM package if $PUSH_ARTIFACTS is non-empty and the "dist-pub"
# folder exists.
if [[ "$BUILD_TYPE" == "build" || "$BUILD_TYPE" == "deploy-ephemeral" ]]; then
    # Change the value of PUBLISH_REGISTRY to the registry URL to which you
    # want to publish your package. Please note that you will have to grant
    # publish and view permission to the user dckosmos@adobe.com if your
    # project is in the "dc" organization, or dcms@adobe.com if your project
    # is in the "echosign" organization. Those accounts are the utility
    # Artifactory users used by the Jenkins job.
    cat > .npmrc << EOF
registry=https://artifactory.corp.adobe.com/artifactory/api/npm/npm-virgo-web-release-local/
//artifactory.corp.adobe.com/artifactory/api/npm/npm-virgo-web-release-local/:_auth=$NPM_AUTH
email=$NPM_EMAIL
always-auth=true
EOF
    cat >> dist-aggregation/.npmrc << EOF
registry=https://artifactory.corp.adobe.com/artifactory/api/npm/npm-virgo-web-release-local/
//artifactory.corp.adobe.com/artifactory/api/npm/npm-virgo-web-release-local/:_auth=$NPM_AUTH
email=$NPM_EMAIL
always-auth=true
EOF

    # If you would like to publish an NPM package, it is assumed that
    # "npm run build" will generate a package.json file in the dist-pub folder
    # with the right package name and version being published and a valid
    # registry URL in publishConfig.
    package_name=$([[ "`grep \"\\\"name\\\"[[:blank:]]*:\" package.json`" =~ \"name\".*\"(.*)\" ]] && echo ${BASH_REMATCH[1]})
    package_version=$([[ "`grep \"\\\"version\\\"[[:blank:]]*:\" package.json`" =~ \"version\".*\"(.*)\" ]] && echo ${BASH_REMATCH[1]})

    if [ -z "$package_name" ]; then
        echo "No 'name' property found in package.json! Publishing cannot continue."
        exit 1
    fi

    if [ -z "$package_version" ]; then
        echo "No 'version' property found in package.json! Publishing cannot continue."
        exit 1
    fi

    # If the publishing version is already in the artifactory, don't need to publish again.
    # Ignore any not-found exit error using || true since we look for a non-zero length string.
    version_found=`npm view $package_name versions | grep "$package_version"` || true
    if [ -z "$version_found" ]; then
        echo "Publishing $package_name@$package_version"
        npm publish
        (cd ./dist-aggregation; npm publish)
        echo "Package published: $package_name@$package_version"
    else
        echo "The package $package_name@$package_version is already in the artifactory. Skipping publishing"
    fi
fi
