window.SITE_DATA = {
  "sources": [
    {
      "source_id": "node-a",
      "snapshot_date": "2026-10-23",
      "title": "Current server results"
    }
  ],
  "experiments": [
    {
      "id": "lora-sie-classification",
      "tab_label": "Classification",
      "order": 10,
      "eyebrow": "ModelNet40 · classification",
      "title": "Parameter-efficient adaptation under rotation",
      "status": "complete",
      "question": "Can a Point-MAE representation be adapted for classification while retaining useful behavior when the input rotates?",
      "intuition": "LoRA changes a small set of attention directions instead of retraining every weight. SIE designates one feature half as rotation-stable and the other as rotation-sensitive, then trains them with paired-view matching and a rotation-conditioned predictor. These are learned consistency objectives rather than an architectural guarantee of invariance or equivariance.",
      "method": "Models were trained on the canonical ModelNet40 orientation with seed 2026 while SIE methods formed internal canonical/Haar-SO(3) training pairs. They were then evaluated on unchanged, Z-rotated, and Haar-uniform SO(3)-rotated test clouds. Values use the saved designated checkpoint for each run; checkpoint policy is shown in the table. In the original best-checkpoint runs, ModelNet40 test accuracy—not a separate validation set—selected the checkpoint.",
      "takeaway": "The highest reported canonical accuracy was 92.50%. Among the fully rotation-evaluated saved runs, Point-LoRA-SIE had the highest Z-rotation (86.51%) and SO(3)-rotation (85.33%) accuracy, but every canonical-trained model lost accuracy under rotation.",
      "caveat": "These are single-seed results, mix test-selected best checkpoints with fixed final checkpoints, and are therefore descriptive and potentially optimistic. They are not leakage-free, uncertainty-calibrated model rankings; a clean comparison needs a validation split and multiple seeds.",
      "metrics": [
        {
          "label": "Best canonical OA",
          "value": "92.50%",
          "detail": "Vanilla-LoRA-SIE · best checkpoint"
        },
        {
          "label": "Best SO(3) OA",
          "value": "85.33%",
          "detail": "Point-LoRA-SIE · best checkpoint"
        },
        {
          "label": "Canonical → SO(3) gap",
          "value": "−6.77 pp",
          "detail": "Point-LoRA-SIE"
        }
      ],
      "chart": {
        "type": "protocol-bars",
        "title": "Overall accuracy by test rotation",
        "y_label": "Overall accuracy (%)",
        "series": [
          {
            "name": "Vanilla LoRA-SIE",
            "none": 92.5,
            "z": 81.6,
            "so3": 80.27
          },
          {
            "name": "Point LoRA-SIE",
            "none": 92.1,
            "z": 86.51,
            "so3": 85.33
          },
          {
            "name": "Point LoRA RISP",
            "none": 91.98,
            "z": 84.16,
            "so3": 82.54
          },
          {
            "name": "Point LoRA EQ-RI",
            "none": 91.94,
            "z": 83.18,
            "so3": 82.98
          },
          {
            "name": "Point LoRA SIE-RI",
            "none": 91.49,
            "z": 80.83,
            "so3": 79.74
          },
          {
            "name": "Vanilla LoRA full",
            "none": 92.3,
            "z": 84.12,
            "so3": 83.71
          },
          {
            "name": "Vanilla LoRA layerwise",
            "none": 91.86,
            "z": 82.78,
            "so3": 81.32
          }
        ]
      },
      "table": {
        "columns": [
          "Run",
          "Checkpoint",
          "Canonical",
          "Z rotation",
          "SO(3) rotation"
        ],
        "rows": [
          [
            "Vanilla LoRA-SIE",
            "best · epoch 143",
            "92.50%",
            "81.60%",
            "80.27%"
          ],
          [
            "Point LoRA-SIE",
            "best · epoch 180",
            "92.10%",
            "86.51%",
            "85.33%"
          ],
          [
            "Point LoRA RISP",
            "best · epoch 91",
            "91.98%",
            "84.16%",
            "82.54%"
          ],
          [
            "Point LoRA EQ-RI",
            "best · epoch 101",
            "91.94%",
            "83.18%",
            "82.98%"
          ],
          [
            "Point LoRA SIE-RI",
            "best · epoch 41",
            "91.49%",
            "80.83%",
            "79.74%"
          ],
          [
            "Vanilla LoRA full",
            "final · epoch 300",
            "92.30%",
            "84.12%",
            "83.71%"
          ],
          [
            "Vanilla LoRA layerwise",
            "final · epoch 300",
            "91.86%",
            "82.78%",
            "81.32%"
          ],
          [
            "Point LoRA full",
            "final · epoch 300",
            "92.38%",
            "—",
            "—"
          ],
          [
            "Point LoRA RI",
            "final · epoch 300",
            "90.80%",
            "—",
            "—"
          ]
        ]
      },
      "source_id": "node-a",
      "snapshot_date": "2026-10-23"
    },
    {
      "id": "vanilla-lora-layerwise",
      "tab_label": "Layerwise SIE",
      "order": 15,
      "eyebrow": "ModelNet40 · layerwise ablation",
      "title": "Layerwise SIE trails the full-feature comparator",
      "status": "complete",
      "question": "How does applying invariant and rotation-conditioned equivariant losses after every Point-MAE transformer block compare with final-only SIE in the available trained runs?",
      "intuition": "Final-layer supervision can leave early features strongly pose-dependent. Reading out every block and constraining the designated invariant and equivariant halves could shape the whole hierarchy, while sharing the same SIE heads keeps the model architecture and inference path unchanged.",
      "method": "Both methods freeze pretrained Point-MAE and add rank-8 LoRA adapters to every attention QKV and output projection. Each 768-dimensional readout is [CLS, max-pooled patch tokens]: the 384-channel CLS token is designated invariant and the 384-channel pooled patch vector equivariant. The full-feature variant applies SIE only to the final readout and classifies from all 768 channels. The layerwise variant classifies from the final invariant-designated CLS vector and adds the mean SIE invariant, equivariant, variance, and covariance losses over blocks 1–11, sharing the final SIE projector and predictor. Final epoch-300 checkpoints were evaluated over the complete ModelNet40 test set with deterministic per-object rotations.",
      "takeaway": "The layerwise run was lower than the full-feature run in every protocol: 91.86% versus 92.30% without rotation, 82.78% versus 84.12% under Z rotation, and 81.32% versus 83.71% under Haar SO(3). Its canonical-to-SO(3) drop was 10.53 points, compared with 8.59 points for the full-feature run. This motivates a controlled same-classifier ablation before attributing the gap to layerwise supervision.",
      "caveat": "This is not an isolated causal test of layerwise supervision: the full-feature classifier consumes both 384-channel halves and has 98,304 more trainable classifier parameters, whereas the layerwise classifier consumes only the invariant-designated half. Results use one seed and final checkpoints. The learned rotation-conditioned predictor encourages consistency for sampled pairs but does not enforce a group representation or exact equivariance.",
      "metrics": [
        {
          "label": "Layerwise SO(3) OA",
          "value": "81.32%",
          "detail": "Haar-uniform test rotations"
        },
        {
          "label": "Layerwise rotation gap",
          "value": "−10.53 pp",
          "detail": "Canonical → SO(3)"
        },
        {
          "label": "Full vs layerwise",
          "value": "+2.39 pp",
          "detail": "SO(3) OA · full-feature advantage"
        }
      ],
      "chart": {
        "type": "protocol-bars",
        "title": "Final-checkpoint overall accuracy",
        "y_label": "Overall accuracy (%)",
        "series": [
          {
            "name": "Full-feature classifier",
            "none": 92.3,
            "z": 84.12,
            "so3": 83.71
          },
          {
            "name": "Layerwise SIE",
            "none": 91.86,
            "z": 82.78,
            "so3": 81.32
          }
        ]
      },
      "notes": [
        "Mean-class accuracy for full-feature was 88.98% canonical, 78.91% Z, and 78.44% SO(3); layerwise reached 88.46%, 77.23%, and 75.08%.",
        "Cross-entropy loss for full-feature was 0.2508 canonical, 0.5112 Z, and 0.5231 SO(3); layerwise was 0.2645, 0.5679, and 0.5914.",
        "Intermediate readouts pass through the existing final LayerNorm for supervision but are not fed back into the transformer. Layerwise supervision adds no inference-time computation or model parameters relative to the invariant-only Vanilla-LoRA-SIE architecture.",
        "A cleaner follow-up would compare final-only and layerwise SIE with the same classifier input, multiple seeds, and either separate per-layer heads or explicit tests for gradient conflict across shared heads."
      ],
      "table": {
        "columns": [
          "Model",
          "Metric",
          "Canonical",
          "Z rotation",
          "Haar SO(3)"
        ],
        "rows": [
          [
            "Full-feature · final epoch 300",
            "OA",
            "92.30%",
            "84.12%",
            "83.71%"
          ],
          [
            "Full-feature · final epoch 300",
            "MCA",
            "88.98%",
            "78.91%",
            "78.44%"
          ],
          [
            "Full-feature · final epoch 300",
            "Cross-entropy",
            "0.2508",
            "0.5112",
            "0.5231"
          ],
          [
            "Layerwise · final epoch 300",
            "OA",
            "91.86%",
            "82.78%",
            "81.32%"
          ],
          [
            "Layerwise · final epoch 300",
            "MCA",
            "88.46%",
            "77.23%",
            "75.08%"
          ],
          [
            "Layerwise · final epoch 300",
            "Cross-entropy",
            "0.2645",
            "0.5679",
            "0.5914"
          ]
        ]
      },
      "source_id": "node-a",
      "snapshot_date": "2026-10-23"
    },
    {
      "id": "pointmae-rotation-sweep",
      "tab_label": "Point-MAE",
      "order": 20,
      "eyebrow": "Point-MAE · frozen encoder",
      "title": "Global stability hides local feature movement",
      "status": "complete",
      "question": "How does a frozen pretrained Point-MAE representation change as the same object is rotated through a full turn?",
      "intuition": "If a representation is rotation-stable, the rotated embedding should remain close to its canonical embedding. Comparing pooled features and corresponding point features reveals whether global averaging is masking local changes.",
      "method": "Five test objects per class were swept around X, Y, and Z in 5° increments. The analysis covers all 12 transformer blocks: 200 ModelNet40 objects and 80 ShapeNetPart objects, for 60,480 saved final-layer states.",
      "takeaway": "Final pooled cosine stayed high (0.971 ModelNet40; 0.977 ShapeNetPart), yet corresponding point-feature cosine was lower (0.837; 0.842). Roughly 30% of local comparisons fell below 0.8, and 44 dimensions were needed to capture 90% of centered rotation energy.",
      "caveat": "This is one frozen checkpoint and a fixed five-object-per-class sample. High cosine alone does not prove invariance, and the dataset axes are not guaranteed to be semantic axes.",
      "metrics": [
        {
          "label": "Final pooled cosine",
          "value": "0.971",
          "detail": "ModelNet40 · nonzero rotations"
        },
        {
          "label": "Final point cosine",
          "value": "0.837",
          "detail": "ModelNet40 · corresponding points"
        },
        {
          "label": "90% orbit energy",
          "value": "44 dims",
          "detail": "Both datasets · final block"
        }
      ],
      "chart": {
        "type": "depth-lines",
        "title": "Point-MAE similarity through depth",
        "x_label": "Transformer block",
        "y_label": "Mean cosine to canonical pose",
        "x": [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12
        ],
        "series": [
          {
            "name": "ModelNet40 · pooled",
            "values": [
              0.974,
              0.9659,
              0.9612,
              0.9608,
              0.9589,
              0.9564,
              0.9561,
              0.9579,
              0.9614,
              0.9662,
              0.9699,
              0.9713
            ]
          },
          {
            "name": "ModelNet40 · point",
            "values": [
              0.8698,
              0.8601,
              0.8525,
              0.8481,
              0.8408,
              0.8347,
              0.8292,
              0.8321,
              0.8383,
              0.848,
              0.854,
              0.8365
            ]
          },
          {
            "name": "ShapeNetPart · pooled",
            "values": [
              0.978,
              0.9715,
              0.9674,
              0.9667,
              0.9654,
              0.9641,
              0.964,
              0.9659,
              0.9691,
              0.9732,
              0.9762,
              0.9774
            ]
          },
          {
            "name": "ShapeNetPart · point",
            "values": [
              0.8861,
              0.8705,
              0.8585,
              0.8511,
              0.8434,
              0.8381,
              0.8325,
              0.835,
              0.8408,
              0.8509,
              0.856,
              0.8415
            ]
          }
        ]
      },
      "notes": [
        "Final object-reference retrieval was 46.9% on ModelNet40 and 57.1% on ShapeNetPart despite the high pooled cosine.",
        "The median correlation between point radius and local cosine was about −0.86 at block 12: peripheral points tended to change more.",
        "Low angular frequencies dominated, but sensitivity varied with axis and starting orientation."
      ],
      "source_id": "node-a",
      "snapshot_date": "2026-10-23"
    },
    {
      "id": "sonata-rotation-sweep",
      "tab_label": "SONATA",
      "order": 30,
      "eyebrow": "SONATA · frozen encoder",
      "title": "Rotation sensitivity grows with representation depth",
      "status": "complete",
      "question": "Does SONATA preserve the same representation as an object rotates, and how does that behavior change across encoder stages?",
      "intuition": "Early stages describe local geometry, while later stages build more task-relevant context. Measuring every stage shows whether deeper abstraction also increases dependence on pose.",
      "method": "The official frozen encoder was evaluated on the same 200 ModelNet40 and 80 ShapeNetPart objects, with X/Y/Z sweeps every 5°. Coordinates and normals were rotated together.",
      "takeaway": "Pooled similarity fell steadily with depth: 0.983 → 0.744 on ModelNet40 and 0.980 → 0.774 on ShapeNetPart. Relative displacement rose in parallel, reaching 0.659 and 0.631 at the final stage.",
      "caveat": "These are feature diagnostics from one checkpoint and selected objects, not downstream classification or segmentation scores.",
      "metrics": [
        {
          "label": "Stage 0 pooled cosine",
          "value": "0.983",
          "detail": "ModelNet40"
        },
        {
          "label": "Stage 4 pooled cosine",
          "value": "0.744",
          "detail": "ModelNet40"
        },
        {
          "label": "Stage 4 displacement",
          "value": "0.659",
          "detail": "ModelNet40 · relative"
        }
      ],
      "chart": {
        "type": "depth-lines",
        "title": "SONATA pooled similarity by stage",
        "x_label": "Encoder stage",
        "y_label": "Mean cosine to canonical pose",
        "x": [
          0,
          1,
          2,
          3,
          4
        ],
        "series": [
          {
            "name": "ModelNet40",
            "values": [
              0.9825,
              0.9603,
              0.9251,
              0.8083,
              0.7439
            ]
          },
          {
            "name": "ShapeNetPart",
            "values": [
              0.9804,
              0.9481,
              0.9018,
              0.8089,
              0.7741
            ]
          }
        ]
      },
      "table": {
        "columns": [
          "Dataset",
          "Stage 0",
          "Stage 1",
          "Stage 2",
          "Stage 3",
          "Stage 4"
        ],
        "rows": [
          [
            "ModelNet40 pooled cosine",
            "0.983",
            "0.960",
            "0.925",
            "0.808",
            "0.744"
          ],
          [
            "ShapeNetPart pooled cosine",
            "0.980",
            "0.948",
            "0.902",
            "0.809",
            "0.774"
          ],
          [
            "ModelNet40 displacement",
            "0.138",
            "0.228",
            "0.310",
            "0.563",
            "0.659"
          ],
          [
            "ShapeNetPart displacement",
            "0.155",
            "0.267",
            "0.365",
            "0.575",
            "0.631"
          ]
        ]
      },
      "source_id": "node-a",
      "snapshot_date": "2026-10-23"
    },
    {
      "id": "sie-representation",
      "tab_label": "SIE heads",
      "order": 40,
      "eyebrow": "LoRA-SIE · representation diagnostics",
      "title": "The heads separate stable and moving signals—not a valid action",
      "status": "complete",
      "question": "Do the explicitly projected invariant and equivariant heads behave differently along rotation orbits?",
      "intuition": "A useful decomposition should send identity-like information to a stable subspace while allowing another subspace to move predictably with pose. Stability and motion can be checked with orbit statistics, but equivariance additionally requires the learned rotation-conditioned predictor to beat a no-action baseline on unseen rotated states.",
      "method": "Best classification checkpoints were swept through 72 angles per X/Y/Z axis on 200 ModelNet40 and 80 ShapeNetPart objects. Raw CLS-based invariant, max-pooled token equivariant, combined, projected, and group-mean readouts were retained. Cosine, relative displacement, orbit variance, PCA trajectories, per-point features, and the saved SIE predictor were evaluated; predictor errors below pool raw squared residuals across nonzero angles.",
      "takeaway": "Projected invariant heads were nearly unchanged (cosine ≈0.995; orbit variance below 0.8%), while projected equivariant heads moved strongly. However, the saved rotation-conditioned predictor was substantially worse than leaving the state unchanged on both datasets. The evidence supports a stable-versus-pose-sensitive split, not successful equivariance.",
      "caveat": "ModelNet40 was used for checkpoint selection in the original classification runs, so its sweep is descriptive; ShapeNetPart is transfer evidence. PCA axes were fit separately by model/readout and are not directly comparable. Abrupt cardinal-angle changes are repeatable but do not identify their architectural cause.",
      "metrics": [
        {
          "label": "Projected invariant cosine",
          "value": "0.995",
          "detail": "Point-LoRA-SIE · ModelNet40"
        },
        {
          "label": "Invariant orbit variance",
          "value": "0.58%",
          "detail": "Point-LoRA-SIE · ModelNet40"
        },
        {
          "label": "Equivariant orbit variance",
          "value": "77.60%",
          "detail": "Point-LoRA-SIE · ModelNet40"
        },
        {
          "label": "Predictor vs identity",
          "value": "2.733 vs 1.608",
          "detail": "Point-LoRA-SIE · pooled normalized error"
        }
      ],
      "chart": {
        "type": "head-bars",
        "title": "Rotation response of projected heads",
        "series": [
          {
            "name": "Point · invariant",
            "cosine": 0.9953,
            "orbit_variance": 0.00584
          },
          {
            "name": "Point · equivariant",
            "cosine": 0.3231,
            "orbit_variance": 0.77602
          },
          {
            "name": "Vanilla · invariant",
            "cosine": 0.9944,
            "orbit_variance": 0.0073
          },
          {
            "name": "Vanilla · equivariant",
            "cosine": 0.1022,
            "orbit_variance": 0.88558
          }
        ]
      },
      "notes": [
        "Across 60,480 embeddings per readout, the first eight PCA components captured 64.6% of Point-LoRA-SIE invariant-head variance and 75.5% of equivariant-head variance; the corresponding Vanilla-LoRA-SIE values were 72.3% and 59.2%.",
        "The straight streaks in static PC1–PC2 figures partly came from drawing every trajectory and closing 355° back to 0°; the dashboard intentionally showed background points and only the selected trajectory. Genuine adjacent-angle jumps remained in the underlying features.",
        "On ModelNet40, cardinal-angle windows contained 22.2% of steps but 86.2% of the largest 1% Point-LoRA equivariant jumps and 97.7% for Vanilla-LoRA. The concentration weakened on ShapeNetPart (45.7% and 74.3%), so the location of jumps generalized better than a shared smooth angle law.",
        "For Point-LoRA-SIE, the largest equivariant jumps were concentrated in the main pooled tokens rather than the selected-token branch, and a small channel subset dominated the displacement. This localizes the effect but does not prove whether grouping, max pooling, or training caused it."
      ],
      "table": {
        "columns": [
          "Method",
          "Dataset",
          "Projected invariant cosine",
          "Projected equivariant cosine",
          "SIE predictor error",
          "Identity error"
        ],
        "rows": [
          [
            "Point-LoRA-SIE",
            "ModelNet40",
            "0.9953",
            "0.3231",
            "2.733",
            "1.608"
          ],
          [
            "Vanilla-LoRA-SIE",
            "ModelNet40",
            "0.9944",
            "0.1022",
            "3.044",
            "1.951"
          ],
          [
            "Point-LoRA-SIE",
            "ShapeNetPart",
            "0.9946",
            "0.4574",
            "2.943",
            "1.204"
          ],
          [
            "Vanilla-LoRA-SIE",
            "ShapeNetPart",
            "0.9946",
            "0.4048",
            "3.495",
            "1.194"
          ]
        ]
      },
      "source_id": "node-a",
      "snapshot_date": "2026-10-23"
    },
    {
      "id": "latent-actions",
      "tab_label": "Latent actions",
      "order": 50,
      "eyebrow": "PointNet autoencoder · 10 seeds",
      "title": "Reconstruction quality and clean latent actions peak at different times",
      "status": "complete",
      "question": "Does learning to reconstruct rotated shapes automatically organize the latent space into a simple, compositional SO(2) action?",
      "intuition": "A decoder can reconstruct well without arranging its latent states according to a clean rotation law. Tracking reconstruction and fitted latent actions throughout training tests whether the two objectives improve together.",
      "method": "A deterministic 200-object bumped-sphere dataset used 24 z rotations and fixed identity splits of 120/40/40. Ten PointNet autoencoders (seeds 2026–2035) were trained for the same 100-epoch horizon with every epoch checkpointed. At each checkpoint, orbit centering and SVD used training objects only; one ridge penalty per dimension was selected on validation objects; frozen actions were evaluated on unseen test objects at m = 1, 2, 4, 8, 16, 32, 64. Uncertainty resampled the 40 test identities, never individual rotations.",
      "takeaway": "Reconstruction kept improving through epoch 99, while the mean action and state-composition curves at m=8 and 16 bottomed near epoch 41 and then rose. Every seed worsened from epoch 40 to 100 at both dimensions, but seedwise minima occurred over epochs 38–47 rather than at one privileged checkpoint.",
      "caveat": "This is a controlled synthetic SO(2) study with a PointNet autoencoder, not a natural-data benchmark. Epoch 41 is an empirical mean minimum, not a theoretically selected training horizon. Validation-selected ridge changes contribute visible noise at low dimensions, although the late rise is consistent across seeds.",
      "metrics": [
        {
          "label": "Test reconstruction",
          "value": "1.850 → 0.003",
          "detail": "Epoch 0 → 100 · mean over 10 seeds"
        },
        {
          "label": "Best m=8 action error",
          "value": "0.316",
          "detail": "Epoch 41"
        },
        {
          "label": "Nonlinear improvement",
          "value": "51.9%",
          "detail": "m=32 · epoch 100"
        }
      ],
      "chart": {
        "type": "trajectory-lines",
        "title": "Linear action error during training",
        "x_label": "Epoch",
        "y_label": "Held-out action error (lower is better)",
        "x": [
          0,
          40,
          41,
          100
        ],
        "series": [
          {
            "name": "m = 8",
            "values": [
              0.4536,
              0.3223,
              0.3156,
              0.6128
            ]
          },
          {
            "name": "m = 16",
            "values": [
              0.3384,
              0.2449,
              0.2432,
              0.4802
            ]
          }
        ]
      },
      "notes": [
        "The known-latent test recovered the planted two-dimensional rotation action up to the arbitrary SVD basis: E_A = 6.95×10⁻¹² and state-composition error = 1.39×10⁻¹¹.",
        "At epoch 40, m=16 had R captured = 0.984, E_A = 0.245, state-composition error = 0.271, A₀ identity error = 5.39×10⁻⁴, and inverse error = 0.148. At epoch 100 its action, composition, and inverse errors rose to 0.480, 0.533, and 0.362 while A₀ remained near identity.",
        "At m=64, the final representation captured 99.94% of rotation-state variance, yet the linear action error was still 0.289—variance capture and group-law quality are different properties.",
        "Shuffled-correspondence actions produced E_A and state-composition error ≈1 in the dense runs. In the original m=64 sanity run, shuffled delta labels likewise gave E_A = 1.026 and state-composition error = 0.994, versus 0.340 and 0.377 for the trained representation.",
        "For standard fits, low-dimensional validation selection did switch frequently among 10⁻⁸, 10⁻², and 1 (occasionally 10⁻⁶ or 10⁻⁴); it did not select 100. The value 100 was characteristic of shuffled-correspondence controls, so the noisy m=1,2,4 curves should not be described as 10⁻⁸↔100 switching."
      ],
      "table": {
        "columns": [
          "Epoch",
          "m",
          "R captured",
          "Action error",
          "State composition",
          "A₀ identity",
          "Inverse"
        ],
        "rows": [
          [
            "0",
            "8",
            "0.739",
            "0.454",
            "0.507",
            "0.000051",
            "0.316"
          ],
          [
            "40",
            "8",
            "0.941",
            "0.322",
            "0.351",
            "0.000050",
            "0.194"
          ],
          [
            "100",
            "8",
            "0.812",
            "0.613",
            "0.681",
            "0.002378",
            "0.511"
          ],
          [
            "0",
            "16",
            "0.884",
            "0.338",
            "0.374",
            "0.000198",
            "0.223"
          ],
          [
            "40",
            "16",
            "0.984",
            "0.245",
            "0.271",
            "0.000539",
            "0.148"
          ],
          [
            "100",
            "16",
            "0.947",
            "0.480",
            "0.533",
            "0.000081",
            "0.362"
          ],
          [
            "0",
            "64",
            "0.989",
            "0.294",
            "0.311",
            "0.006876",
            "0.203"
          ],
          [
            "40",
            "64",
            "0.999",
            "0.167",
            "0.177",
            "0.003533",
            "0.103"
          ],
          [
            "100",
            "64",
            "0.999",
            "0.289",
            "0.320",
            "0.001028",
            "0.193"
          ]
        ]
      },
      "source_id": "node-a",
      "snapshot_date": "2026-10-23"
    },
    {
      "id": "latent-action-diagnostics",
      "tab_label": "Action diagnostics",
      "order": 55,
      "eyebrow": "PointNet autoencoder · explanatory tests",
      "title": "Late dynamics become nonlinear, but not through one shared coordinate change",
      "status": "complete",
      "question": "Does the late increase in shared linear-action error reflect object-specific laws, a modest nonlinear action, or one nonlinear coordinate map that makes every action linear?",
      "intuition": "These explanations make different predictions. An object-specific oracle should stay accurate if only sharing fails; a small residual MLP should help if the action becomes nonlinear; and one invertible map should close the gap if the nonlinearity is merely a common change of coordinates.",
      "method": "Using the same train-fitted SVD coordinates, the study compared frozen shared ridge actions with (i) per-test-object linear oracles using six-fold held-out starting orientations and nested ridge selection, (ii) capacity-controlled residual MLPs trained on train objects with width and regularization selected on validation objects, and (iii) a small exactly invertible coupling map shared across objects and all deltas, also selected only on validation. All predictors used identical unseen-object transitions. Decoder interventions separately compared D(AΔz) with the rotated decode and no-action baselines.",
      "takeaway": "The per-object oracle also degraded sharply after epoch 40, so object specificity is not the main explanation. At epoch 100 the residual MLP beat the linear map in all 10 seeds, but the shared invertible-coordinate model was worse than both. Within the tested capacity, late training creates genuinely harder nonlinear dynamics rather than a single shared coordinate warp that restores a linear action.",
      "caveat": "The oracle tests held-out starting transitions, not complete state isolation, and remains linear within each object. Failure of the selected coupling-network family does not rule out every possible invertible map. Decoder Chamfer distance is permutation-insensitive and should be read alongside latent and ordered-point errors.",
      "metrics": [
        {
          "label": "m=16 residual MLP",
          "value": "0.297 vs 0.480",
          "detail": "Nonlinear vs linear · epoch 100"
        },
        {
          "label": "m=16 coordinate map",
          "value": "0.599",
          "detail": "Conjugated-linear error · epoch 100"
        },
        {
          "label": "m=8 oracle change",
          "value": "+0.550",
          "detail": "E_oracle · epoch 40 → 100"
        }
      ],
      "chart": {
        "type": "trajectory-lines",
        "title": "Capacity-controlled action predictors at m = 16",
        "x_label": "Epoch",
        "y_label": "Held-out action error (lower is better)",
        "x": [
          0,
          40,
          100
        ],
        "series": [
          {
            "name": "Shared linear",
            "values": [
              0.3384,
              0.2449,
              0.4802
            ]
          },
          {
            "name": "Residual MLP",
            "values": [
              0.3406,
              0.2498,
              0.297
            ]
          },
          {
            "name": "Conjugated linear",
            "values": [
              0.4014,
              0.3097,
              0.5988
            ]
          }
        ]
      },
      "notes": [
        "The main linear/MLP/conjugated columns use the original globally pooled action metric. The oracle comparison reports its shared baseline under the oracle protocol's per-object aggregation; it is shown separately so the object oracle is compared only with the exactly matched shared baseline.",
        "At m=8, E_shared/E_oracle changed from 0.362/0.207 at epoch 40 to 0.625/0.756 at epoch 100; at m=16 it changed from 0.273/0.166 to 0.490/0.546. Both oracle increases occurred in all 10 seeds, and the shared-minus-oracle gap shrank rather than grew.",
        "The residual MLP did not help at initialization or near the linear optimum: at m=16 it scored 0.341 vs 0.338 at epoch 0 and 0.250 vs 0.245 at epoch 40. Its advantage is specifically late-training behavior.",
        "At epoch 100 and m=16, the invertible-coordinate predictor had test error 0.599 and mapped-back state-composition error 0.707, both worse than the direct linear errors of 0.480 and 0.533.",
        "At epoch 100 and m=16, latent intervention reduced decoder Chamfer from the no-action baseline 0.02687 to 0.01222, but remained above the decoded-target reference 0.00402. The action therefore changes decoded geometry usefully without reproducing the target state."
      ],
      "table": {
        "columns": [
          "Epoch",
          "m",
          "Main linear",
          "Residual MLP",
          "Conjugated linear",
          "Oracle-protocol shared",
          "Object oracle"
        ],
        "rows": [
          [
            "0",
            "8",
            "0.454",
            "0.454",
            "0.503",
            "0.494",
            "0.261"
          ],
          [
            "40",
            "8",
            "0.322",
            "0.324",
            "0.401",
            "0.362",
            "0.207"
          ],
          [
            "100",
            "8",
            "0.613",
            "0.459",
            "0.695",
            "0.625",
            "0.756"
          ],
          [
            "0",
            "16",
            "0.338",
            "0.341",
            "0.401",
            "0.363",
            "0.243"
          ],
          [
            "40",
            "16",
            "0.245",
            "0.250",
            "0.310",
            "0.273",
            "0.166"
          ],
          [
            "100",
            "16",
            "0.480",
            "0.297",
            "0.599",
            "0.490",
            "0.546"
          ]
        ]
      },
      "source_id": "node-a",
      "snapshot_date": "2026-10-23"
    },
    {
      "id": "se3-jepa",
      "tab_label": "SE3-JEPA",
      "order": 60,
      "eyebrow": "SE3-JEPA · live single-seed snapshot",
      "title": "Masked prediction with typed geometric features",
      "status": "running",
      "question": "Can a JEPA predict masked point-cloud latents while keeping every learned scalar and vector channel consistent with rigid motions, then adapt the encoder without breaking that structure?",
      "intuition": "A scalar should not change under rotation, while each vector channel should rotate with the input. Relative coordinates are expanded in spherical harmonics and coupled to features by e3nn tensor products, so those transformation rules are architectural rather than learned from augmentation. The JEPA predicts an EMA teacher's hidden-patch features instead of reconstructing XYZ. During downstream adaptation, LoRA changes invariant coefficient functions, and classification pools only invariant scalars and vector norms.",
      "method": "The vector model uses 32 scalar and 16 vector channels, 64 exclusive FPS/Voronoi patches, a four-layer student encoder, a two-layer context-to-target predictor, 59.38% random masking, and SO(3)-rotated ShapeNet-55 inputs. The teacher tokenizer and encoder are EMA copies. ModelNet40 adaptation starts from the frozen epoch-176 teacher snapshot and applies rank-8 LoRA to radial MLPs, scalar attention queries/keys, and scalar gates; 86,280 of 698,984 parameters are trainable.",
      "takeaway": "At export, pretraining had reached epoch 190/300; its best validation loss was 0.13295 at epoch 187. The downstream run had reached epoch 38/100. Its checkpoint-selected best result was epoch 35: 78.04% on both unrotated and deterministically SO(3)-rotated ModelNet40. This equality is expected from the invariant readout and supports implementation consistency; it is not evidence that augmentation alone learned rotation robustness.",
      "caveat": "Both production runs are active, use one seed, and are not final benchmark comparisons. Equivariance is guaranteed for the learned operations on a fixed graph in exact arithmetic; FPS, nearest assignment, kNN/radius boundaries, ties, and floating point make the complete pipeline only piecewise equivariant. Masked content is excluded after the shared FPS/Voronoi partition is built, so the current implementation demonstrates post-partition content isolation, not the stronger claim that patch construction itself never observes target points.",
      "metrics": [
        {
          "label": "Best pretraining loss",
          "value": "0.13295",
          "detail": "Epoch 187 · ShapeNet-55 validation"
        },
        {
          "label": "Best interim LoRA accuracy",
          "value": "78.04%",
          "detail": "Epoch 35 · unrotated and SO(3)"
        },
        {
          "label": "Best-checkpoint rotation gap",
          "value": "0.00 pp",
          "detail": "SO(3) minus unrotated · epoch 35"
        }
      ],
      "chart": {
        "type": "progress",
        "title": "Run progress at export time",
        "series": [
          {
            "name": "ShapeNet-55 pretraining",
            "value": 190,
            "total": 300,
            "detail": "validation loss 0.1331"
          },
          {
            "name": "ModelNet40 LoRA",
            "value": 38,
            "total": 100,
            "detail": "best mean accuracy 78.04% at epoch 35"
          },
          {
            "name": "Trainable parameters",
            "value": 12.34,
            "total": 100,
            "detail": "86,280 / 698,984"
          }
        ]
      },
      "notes": [
        "The LoRA source is an immutable copy of the then-best epoch-176 pretraining checkpoint (validation loss 0.13405). Pretraining continued independently and later improved, so the downstream run does not use the epoch-187 weights.",
        "Focused FP32 tests passed 13/13. On the deterministic test instance, context, prediction, and teacher maximum absolute equivariance errors were 9.92e-6, 8.43e-6, and 1.17e-5; the rotated loss difference was 0.0 (test tolerance 3e-4).",
        "Software smoke checks were finite: CPU two-step train loss 0.95849 → 0.89301, validation loss 0.82917 → 0.81090, and a fixed-batch 12-step overfit loss 1.48184 → 0.46100. These are execution checks, not benchmark results.",
        "The production vector configuration has 1,530,664 total parameters and 917,960 student/predictor trainable parameters. A measured B=32, N=2048 forward/backward used about 2.79 GiB FP32 or 1.41 GiB with bfloat16 autocast on the test GPU; these are allocator- and platform-dependent measurements."
      ],
      "table": {
        "columns": [
          "Record",
          "Epoch",
          "Unrotated / validation",
          "SO(3)",
          "Status or provenance"
        ],
        "rows": [
          [
            "Pretraining snapshot used by LoRA",
            "176",
            "0.13405 loss",
            "—",
            "Immutable teacher source"
          ],
          [
            "Best pretraining at export",
            "187",
            "0.13295 loss",
            "—",
            "Current best through epoch 190"
          ],
          [
            "Best LoRA checkpoint at export",
            "35",
            "78.04%",
            "78.04%",
            "Selected by mean of both accuracies"
          ],
          [
            "Latest LoRA epoch at export",
            "38",
            "77.71%",
            "77.67%",
            "Run active; not checkpoint-selected"
          ]
        ]
      },
      "source_id": "node-a",
      "snapshot_date": "2026-10-23"
    },
    {
      "id": "controlled-benchmarks",
      "tab_label": "Benchmark plan",
      "order": 70,
      "eyebrow": "Unified benchmark framework",
      "title": "The controlled comparison is ready; the full matrix is not yet run",
      "status": "ready",
      "question": "How do eight point-cloud methods compare when rotation, data flow, seeds, and evaluation are controlled outside the architecture?",
      "intuition": "A fair rotation study must apply the same experimental transform before each method's own sampling and geometry, while preserving author-specific architectures and optimization recipes.",
      "method": "The frozen plan covers ModelNet40, ScanObjectNN PB_T50_RS, and ShapeNetPart. Protocols are Z→Z, Z→SO(3), and SO(3)→SO(3), with seeds 2026–2028 and deterministic evaluation rotations.",
      "takeaway": "The ScanObjectNN matrix contains 72 experiments (8 methods × 3 protocols × 3 seeds); ShapeNetPart contains 63 (7 × 3 × 3). Integration, lifecycle, and rotation-path checks are complete, but substantive benchmark training has not been run on this server.",
      "caveat": "No accuracy or IoU should be inferred from framework completeness. Smoke tests demonstrate execution correctness, not scientific performance.",
      "metrics": [
        {
          "label": "ScanObjectNN plan",
          "value": "72 runs",
          "detail": "8 methods · 3 protocols · 3 seeds"
        },
        {
          "label": "ShapeNetPart plan",
          "value": "63 runs",
          "detail": "7 methods · 3 protocols · 3 seeds"
        },
        {
          "label": "Substantive runs",
          "value": "0 / 135",
          "detail": "Framework ready"
        }
      ],
      "chart": {
        "type": "matrix",
        "title": "Frozen controlled protocols",
        "methods": [
          "PointNet",
          "PointNet++",
          "DGCNN",
          "RSCNN",
          "RISurConv",
          "DiPVNet",
          "EnRI-GAM",
          "RIConv"
        ],
        "protocols": [
          "Z → Z",
          "Z → SO(3)",
          "SO(3) → SO(3)"
        ],
        "segmentation_excludes": [
          "EnRI-GAM"
        ]
      },
      "notes": [
        "Controlled flow: canonical sample → experimental rotation → method-specific sampling/geometry/augmentation → author model.",
        "Evaluation rotation is deterministic from seed, split, and stable sample identity.",
        "Integrations explicitly distinguish author-native paths from controlled adaptations."
      ],
      "source_id": "node-a",
      "snapshot_date": "2026-10-23"
    }
  ]
};
