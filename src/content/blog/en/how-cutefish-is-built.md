---
title: How Cutefish packages are built
description: Every Cutefish package is built in the open, from public source, by a public workflow, and signed by a key that never leaves it.
date: 2026-10-20
---

Cutefish Desktop now has an APT repository for Debian 13 at
`deb.cutefish.org`. Since installing a package
means trusting whoever built it, this post explains exactly how the packages
are made, so you do not have to take our word for it.

## Built in the open

No package in the repository is built on a developer's computer or on a
server we run. Every package is built by
[GitHub Actions](https://github.com/cutefishos/packaging/actions) on
GitHub-hosted machines, in a fresh Debian 13 container that is thrown away
after each build.

Everything that goes into a build is public:

- The source code comes straight from the project repositories under
  [github.com/cutefishos](https://github.com/cutefishos).
- The packaging and the build steps are in the
  [packaging](https://github.com/cutefishos/packaging) repository. The
  workflow that builds and publishes the packages is
  [`.github/workflows/build.yml`](https://github.com/cutefishos/packaging/blob/main/.github/workflows/build.yml),
  and anyone can read what it does.
- Build tools and libraries come from the official Debian archive.
- Skia, the graphics library the toolkit uses, is fetched at a fixed revision
  from Google's own repository, skia.googlesource.com.

The log of every build is public, too. You can open any run on the
[Actions page](https://github.com/cutefishos/packaging/actions) and read
every command it ran and everything it printed.

## Every package names its commit

Nightly packages carry the commit they were built from in their version. For
example, `0.1.0+git20261019175928.ef1a42b-1` was built from commit
`ef1a42b`, made on October 19, 2026 at 17:59:28 UTC. To see the exact code
inside a package, look up that commit in the project's repository.

The repository serves the source packages next to the binary ones, so you
can also download the source of any package with `apt source` and compare it
with GitHub.

Each build also lists exactly what it used and what it made, at the end of
its log and on the run's summary page:

- `commits`: the commit of the packaging repository and of every project
  that went into the build.
- `SHA256SUMS`: the SHA-256 checksum of every file the build produced.

Both are published with the packages, at
`https://deb.cutefish.org/dists/trixie-nightly/commits` and
`https://deb.cutefish.org/dists/trixie-nightly/SHA256SUMS`.

## Tracing a file back to its build

For every file it produces, the build also creates a signed
[build provenance attestation](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations/using-artifact-attestations-to-establish-provenance-for-builds).
It records which repository, which workflow, which commit and which run
produced the file with a given checksum. GitHub signs it through
[Sigstore](https://www.sigstore.dev/), not with any key of ours, and it is
recorded in Sigstore's public transparency log, so it cannot be quietly
created or changed afterwards.

To check a package you downloaded, use the [GitHub CLI](https://cli.github.com/),
version 2.49 or later, signed in with `gh auth login`. The `gh` package in
Debian 13 is older; get a current one from cli.github.com.

```
apt download cutefish-core
gh attestation verify cutefish-core_*.deb --repo cutefishos/packaging
```

If the file was not built by the Cutefish workflow, or was changed in any way
after it was built, the check fails. If it passes, the output links to the
exact workflow run, whose full log you can read.

## The ISO

The live ISO is built the same way, by
[`.github/workflows/iso.yml`](https://github.com/cutefishos/packaging/blob/main/.github/workflows/iso.yml)
in the same repository, from the
[live-build configuration](https://github.com/cutefishos/packaging/tree/main/iso)
next to it. It installs the Cutefish packages from deb.cutefish.org and
everything else from the official Debian archive. Nightly ISOs are published
on deb.cutefish.org, each with three files:

- `.iso`: the image.
- `.iso.sha256`: its SHA-256 checksum.
- `.packages`: every package in the image, with its version.

`LATEST` names the newest one. To download it, check its checksum and verify
its attestation:

```
name=$(curl -fsSL https://deb.cutefish.org/iso/nightly/LATEST)
curl -fLO "https://deb.cutefish.org/iso/nightly/$name.iso"
curl -fLO "https://deb.cutefish.org/iso/nightly/$name.iso.sha256"
curl -fLO "https://deb.cutefish.org/iso/nightly/$name.packages"
sha256sum -c "$name.iso.sha256"
gh attestation verify "$name.iso" --repo cutefishos/packaging
```

Every Cutefish package in `.packages` carries its commit in its version, as
above, so you can trace the whole image back to its source.

## Signed by the build, and only the build

APT checks the signature of the repository before it installs anything from
it. The Cutefish repository is signed with this key:

```
Cutefish Archive <reionwong@gmail.com>
ed25519, fingerprint 5F52 7F0C B976 4BA0 AF99  BAE5 F4A4 30BC 9E10 91A7
```

The private key is stored as an encrypted secret of the packaging
repository. Only the build workflow can read it, and nothing else ever signs
with it. Apart from that secret, the only copy is an offline backup. Releases
are not signed by hand on someone's laptop.

Uploading to deb.cutefish.org works the same way: the storage behind it only
accepts uploads with a key that, again, only the build workflow holds.

## Installing

Download the key, check that its fingerprint matches the one above, and add
the repository:

```
sudo curl -fsSLo /etc/apt/keyrings/cutefish.asc https://deb.cutefish.org/cutefish.asc
gpg --show-keys /etc/apt/keyrings/cutefish.asc
echo "deb [signed-by=/etc/apt/keyrings/cutefish.asc] https://deb.cutefish.org trixie-nightly main" \
  | sudo tee /etc/apt/sources.list.d/cutefish.list
sudo apt update
sudo apt install cutefish-desktop
```

`signed-by` limits the key to this repository, so it cannot vouch for
packages from anywhere else.

## What this does not cover

The packages are not yet reproducible: building the same commit twice does
not produce byte-identical files, so you cannot rebuild a package yourself and
compare checksums. That is something we would like to get to.

`trixie-nightly` is built from the latest code every night. It is meant for
testing, and things in it can break.

## Only from official sources

Packages and ISOs from anywhere other than deb.cutefish.org and
[github.com/cutefishos](https://github.com/cutefishos) were not built by us.
See [the official sources of Cutefish](/blog/official-sources) for more.
