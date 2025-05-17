import Array "mo:base/Array";
import Text "mo:base/Text";

actor IcpBootcamp {
  type Candidate = Text;
  type Voter = {
    name : Text;
    votedFor : Nat;
  };

  var candidates : [Candidate] = ["Alice", "Bob", "Charlie"];
  var votes : [Nat] = [0, 0, 0];
  var voters : [Voter] = [];

  // Cek apakah voter dengan nama tersebut sudah memilih
  func hasVoted(voterName : Text) : Bool {
    for (voter in voters.vals()) {
      if (Text.equal(voter.name, voterName)) {
        return true;
      };
    };
    return false;
  };

  public query func getCandidates() : async [Candidate] {
    return candidates;
  };

  public query func getVotes() : async [Nat] {
    return votes;
  };

  // Fungsi untuk mendapatkan hasil voting
  public query func getResults() : async [{ candidate : Text; voteCount : Nat }] {
    let results = Array.tabulate<{ candidate : Text; voteCount : Nat }>(
      candidates.size(),
      func(i) {
        return { candidate = candidates[i]; voteCount = votes[i] };
      },
    );
    return results;
  };

  // Fungsi untuk voting berdasarkan nama
  public func vote(candidateIndex : Nat, voterName : Text) : async Text {
    // Validasi nama tidak kosong
    if (Text.size(voterName) == 0) {
      return "Nama pemilih tidak boleh kosong.";
    };

    // Cek apakah voter sudah memilih sebelumnya
    if (hasVoted(voterName)) {
      return "Anda sudah melakukan pemilihan sebelumnya.";
    };

    // Cek apakah kandidat valid
    if (candidateIndex >= candidates.size()) {
      return "Kandidat tidak valid.";
    };

    // Tambah vote
    votes := Array.tabulate<Nat>(
      votes.size(),
      func(i) {
        if (i == candidateIndex) {
          return votes[i] + 1;
        } else {
          return votes[i];
        };
      },
    );

    // Catat voter
    voters := Array.append(voters, [{ name = voterName; votedFor = candidateIndex }]);

    return "Vote berhasil tercatat untuk " # candidates[candidateIndex];
  };

  // Fungsi untuk cek status voter berdasarkan nama
  public query func checkVoterStatus(voterName : Text) : async Bool {
    return hasVoted(voterName);
  };
};
