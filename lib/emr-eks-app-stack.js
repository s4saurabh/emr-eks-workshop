"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmrEksAppStack = void 0;
const cdk = require("@aws-cdk/core");
const eks = require("@aws-cdk/aws-eks");
const ec2 = require("@aws-cdk/aws-ec2");
const cloud9 = require("@aws-cdk/aws-cloud9");
const aws_iam_1 = require("@aws-cdk/aws-iam");
class EmrEksAppStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const clusterAdmin = new aws_iam_1.Role(this, 'emr-eks-adminRole', {
            assumedBy: new aws_iam_1.ServicePrincipal('ec2.amazonaws.com'),
        });
        clusterAdmin.addManagedPolicy(aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));
        const emrEksRole = new aws_iam_1.Role(this, 'EMR_EKS_Job_Execution_Role', {
            assumedBy: new aws_iam_1.ServicePrincipal('eks.amazonaws.com'),
            roleName: 'EMR_EKS_Job_Execution_Role'
        });
        // Attach this instance role to Cloud9-EC2 instance and disable AWS Temp Credentials on Cloud9
        const emreksInstanceProfile = new aws_iam_1.CfnInstanceProfile(this, 'InstanceProfile', {
            instanceProfileName: 'emr-eks-instance-profile',
            roles: [
                clusterAdmin.roleName,
            ],
        });
        emrEksRole.addToPolicy(new aws_iam_1.PolicyStatement({
            resources: ['*'],
            actions: ['s3:PutObject', 's3:GetObject', 's3:ListBucket'],
        }));
        emrEksRole.addToPolicy(new aws_iam_1.PolicyStatement({
            resources: ['arn:aws:logs:*:*:*'],
            actions: ['logs:PutLogEvents', 'logs:CreateLogStream', 'logs:DescribeLogGroups', 'logs:DescribeLogStreams'],
        }));
        const vpc = new ec2.Vpc(this, "eks-vpc");
        const eksCluster = new eks.Cluster(this, "Cluster", {
            vpc: vpc,
            mastersRole: clusterAdmin,
            defaultCapacity: 0,
            version: eks.KubernetesVersion.V1_18,
        });
        eksCluster.addNodegroupCapacity("ondemand-ng", {
            instanceTypes: [
                new ec2.InstanceType('r5.xlarge'),
                new ec2.InstanceType('r5.2xlarge'),
                new ec2.InstanceType('r5.4xlarge')
            ],
            minSize: 2,
            maxSize: 4,
            capacityType: eks.CapacityType.ON_DEMAND,
        });
        eksCluster.addNodegroupCapacity("spot-ng", {
            instanceTypes: [
                new ec2.InstanceType('r5.xlarge'),
                new ec2.InstanceType('r5.2xlarge'),
                new ec2.InstanceType('r5.4xlarge')
            ],
            minSize: 2,
            maxSize: 4,
            capacityType: eks.CapacityType.SPOT,
        });
        const c9env = new cloud9.Ec2Environment(this, 'Cloud9Env', { vpc });
        new cdk.CfnOutput(this, 'URL', { value: c9env.ideUrl });
        new cdk.CfnOutput(this, 'EKSCluster', {
            value: eksCluster.clusterName,
            description: 'Eks cluster name',
            exportName: "EKSClusterName"
        });
        new cdk.CfnOutput(this, 'EKSClusterAdminArn', { value: clusterAdmin.roleArn });
        new cdk.CfnOutput(this, 'EMRJobExecutionRoleArn', { value: emrEksRole.roleArn });
        //new cdk.CfnOutput(this, 'BootStrapCommand', { value: 'sh bootstrap_cdk.sh '.join() emrEksRole.roleArn });
        new cdk.CfnOutput(this, 'BootStrapCommand', { value: 'sh bootstrap_cdk.sh '.concat(eksCluster.clusterName).concat(' ').concat(this.region).concat(' ').concat(clusterAdmin.roleArn) });
    }
}
exports.EmrEksAppStack = EmrEksAppStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1yLWVrcy1hcHAtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJlbXItZWtzLWFwcC1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBcUM7QUFDckMsd0NBQXdDO0FBQ3hDLHdDQUF3QztBQUV4Qyw4Q0FBOEM7QUFDOUMsOENBTzBCO0FBRzFCLE1BQWEsY0FBZSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3pDLFlBQVksS0FBYyxFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLFlBQVksR0FBRyxJQUFJLGNBQUksQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDdkQsU0FBUyxFQUFFLElBQUksMEJBQWdCLENBQUMsbUJBQW1CLENBQUM7U0FFckQsQ0FBQyxDQUFDO1FBRUgsWUFBWSxDQUFDLGdCQUFnQixDQUFDLHVCQUFhLENBQUMsd0JBQXdCLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO1FBRTdGLE1BQU0sVUFBVSxHQUFHLElBQUksY0FBSSxDQUFDLElBQUksRUFBRSw0QkFBNEIsRUFBRTtZQUM5RCxTQUFTLEVBQUUsSUFBSSwwQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQztZQUNwRCxRQUFRLEVBQUUsNEJBQTRCO1NBQ3ZDLENBQUMsQ0FBQztRQUVILDhGQUE4RjtRQUM5RixNQUFNLHFCQUFxQixHQUFHLElBQUksNEJBQWtCLENBQ2xELElBQUksRUFDSixpQkFBaUIsRUFDakI7WUFDRSxtQkFBbUIsRUFBRSwwQkFBMEI7WUFDL0MsS0FBSyxFQUFFO2dCQUNMLFlBQVksQ0FBQyxRQUFRO2FBQ3RCO1NBQ0YsQ0FDRixDQUFDO1FBRUYsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLHlCQUFlLENBQUM7WUFDekMsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ2hCLE9BQU8sRUFBRSxDQUFDLGNBQWMsRUFB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QyxDQUFDO0lBR3ZMLENBQUM7Q0FDRjtBQW5GRCx3Q0FtRkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcIkBhd3MtY2RrL2NvcmVcIjtcbmltcG9ydCAqIGFzIGVrcyBmcm9tIFwiQGF3cy1jZGsvYXdzLWVrc1wiO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gXCJAYXdzLWNkay9hd3MtZWMyXCI7XG5pbXBvcnQgeyBDZm5Kc29uIH0gZnJvbSBcIkBhd3MtY2RrL2NvcmVcIjtcbmltcG9ydCAqIGFzIGNsb3VkOSBmcm9tICdAYXdzLWNkay9hd3MtY2xvdWQ5JztcbmltcG9ydCB7IFxuICAgTWFuYWdlZFBvbGljeSwgXG4gICBSb2xlLCBcbiAgIFNlcnZpY2VQcmluY2lwYWwsIFxuICAgUG9saWN5U3RhdGVtZW50LCBcbiAgIEVmZmVjdCxcbiAgIENmbkluc3RhbmNlUHJvZmlsZVxufSBmcm9tICdAYXdzLWNkay9hd3MtaWFtJztcblxuXG5leHBvcnQgY2xhc3MgRW1yRWtzQXBwU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQXBwLCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCBjbHVzdGVyQWRtaW4gPSBuZXcgUm9sZSh0aGlzLCAnZW1yLWVrcy1hZG1pblJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBTZXJ2aWNlUHJpbmNpcGFsKCdlYzIuYW1hem9uYXdzLmNvbScpLFxuICAgICAgXG4gICAgfSk7XG5cbiAgICBjbHVzdGVyQWRtaW4uYWRkTWFuYWdlZFBvbGljeShNYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQWRtaW5pc3RyYXRvckFjY2VzcycpKTtcblxuICAgIGNvbnN0IGVtckVrc1JvbGUgPSBuZXcgUm9sZSh0aGlzLCAnRU1SX0VLU19Kb2JfRXhlY3V0aW9uX1JvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBTZXJ2aWNlUHJpbmNpcGFsKCdla3MuYW1hem9uYXdzLmNvbScpLFxuICAgICAgcm9sZU5hbWU6ICdFTVJfRUtTX0pvYl9FeGVjdXRpb25fUm9sZSdcbiAgICB9KTtcblxuICAgIC8vIEF0dGFjaCB0aGlzIGluc3RhbmNlIHJvbGUgdG8gQ2xvdWQ5LUVDMiBpbnN0YW5jZSBhbmQgZGlzYWJsZSBBV1MgVGVtcCBDcmVkZW50aWFscyBvbiBDbG91ZDlcbiAgICBjb25zdCBlbXJla3NJbnN0YW5jZVByb2ZpbGUgPSBuZXcgQ2ZuSW5zdGFuY2VQcm9maWxlKFxuICAgICAgdGhpcyxcbiAgICAgICdJbnN0YW5jZVByb2ZpbGUnLFxuICAgICAge1xuICAgICAgICBpbnN0YW5jZVByb2ZpbGVOYW1lOiAnZW1yLWVrcy1pbnN0YW5jZS1wcm9maWxlJyxcbiAgICAgICAgcm9sZXM6IFtcbiAgICAgICAgICBjbHVzdGVyQWRtaW4ucm9sZU5hbWUsXG4gICAgICAgIF0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIGVtckVrc1JvbGUuYWRkVG9Qb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgICAgYWN0aW9uczogWydzMzpQdXRPYmplY3QnLCdzMzpHZXRPYmplY3QnLCdzMzpMaXN0QnVja2V0J10sXG4gICAgfSkpOyBcblxuICAgIGVtckVrc1JvbGUuYWRkVG9Qb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICByZXNvdXJjZXM6IFsnYXJuOmF3czpsb2dzOio6KjoqJ10sXG4gICAgICBhY3Rpb25zOiBbJ2xvZ3M6UHV0TG9nRXZlbnRzJywgJ2xvZ3M6Q3JlYXRlTG9nU3RyZWFtJywgJ2xvZ3M6RGVzY3JpYmVMb2dHcm91cHMnLCAnbG9nczpEZXNjcmliZUxvZ1N0cmVhbXMnXSxcbiAgICB9KSk7IFxuXG4gICAgY29uc3QgdnBjID0gbmV3IGVjMi5WcGModGhpcywgXCJla3MtdnBjXCIpO1xuXG4gICAgY29uc3QgZWtzQ2x1c3RlciA9IG5ldyBla3MuQ2x1c3Rlcih0aGlzLCBcIkNsdXN0ZXJcIiwge1xuICAgICAgdnBjOiB2cGMsXG4gICAgICBtYXN0ZXJzUm9sZTogY2x1c3RlckFkbWluLFxuICAgICAgZGVmYXVsdENhcGFjaXR5OiAwLCAvLyB3ZSB3YW50IHRvIG1hbmFnZSBjYXBhY2l0eSBvdXJzZWx2ZXNcbiAgICAgIHZlcnNpb246IGVrcy5LdWJlcm5ldGVzVmVyc2lvbi5WMV8xOCxcbiAgICB9KTtcblxuICAgIGVrc0NsdXN0ZXIuYWRkTm9kZWdyb3VwQ2FwYWNpdHkoXCJvbmRlbWFuZC1uZ1wiLCB7XG4gICAgICBpbnN0YW5jZVR5cGVzOiBbXG4gICAgICAgIG5ldyBlYzIuSW5zdGFuY2VUeXBlKCdyNS54bGFyZ2UnKSxcbiAgICAgICAgbmV3IGVjMi5JbnN0YW5jZVR5cGUoJ3I1LjJ4bGFyZ2UnKSxcbiAgICAgICAgbmV3IGVjMi5JbnN0YW5jZVR5cGUoJ3I1LjR4bGFyZ2UnKV0sXG4gICAgICBtaW5TaXplOiAyLFxuICAgICAgbWF4U2l6ZTogNCxcbiAgICAgIGNhcGFjaXR5VHlwZTogZWtzLkNhcGFjaXR5VHlwZS5PTl9ERU1BTkQsXG4gICAgfSk7XG5cbiAgICBla3NDbHVzdGVyLmFkZE5vZGVncm91cENhcGFjaXR5KFwic3BvdC1uZ1wiLCB7XG4gICAgICBpbnN0YW5jZVR5cGVzOiBbXG4gICAgICAgIG5ldyBlYzIuSW5zdGFuY2VUeXBlKCdyNS54bGFyZ2UnKSxcbiAgICAgICAgbmV3IGVjMi5JbnN0YW5jZVR5cGUoJ3I1LjJ4bGFyZ2UnKSxcbiAgICAgICAgbmV3IGVjMi5JbnN0YW5jZVR5cGUoJ3I1LjR4bGFyZ2UnKV0sXG4gICAgICBtaW5TaXplOiAyLFxuICAgICAgbWF4U2l6ZTogNCxcbiAgICAgIGNhcGFjaXR5VHlwZTogZWtzLkNhcGFjaXR5VHlwZS5TUE9ULFxuICAgIH0pO1xuXG4gICBjb25zdCBjOWVudiA9IG5ldyBjbG91ZDkuRWMyRW52aXJvbm1lbnQodGhpcywgJ0Nsb3VkOUVudicsIHsgdnBjIH0pO1xuICAgXHRcblxuICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1VSTCcsIHsgdmFsdWU6IGM5ZW52LmlkZVVybCB9KTtcbiAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdFS1NDbHVzdGVyJywge1xuICAgICAgdmFsdWU6IGVrc0NsdXN0ZXIuY2x1c3Rlck5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ0VrcyBjbHVzdGVyIG5hbWUnLFxuICAgICAgZXhwb3J0TmFtZTpcIkVLU0NsdXN0ZXJOYW1lXCJcbiAgICB9KTtcbiAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdFS1NDbHVzdGVyQWRtaW5Bcm4nLCB7IHZhbHVlOiBjbHVzdGVyQWRtaW4ucm9sZUFybiB9KTtcbiAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdFTVJKb2JFeGVjdXRpb25Sb2xlQXJuJywgeyB2YWx1ZTogZW1yRWtzUm9sZS5yb2xlQXJuIH0pO1xuICAgLy9uZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQm9vdFN0cmFwQ29tbWFuZCcsIHsgdmFsdWU6ICdzaCBib290c3RyYXBfY2RrLnNoICcuam9pbigpIGVtckVrc1JvbGUucm9sZUFybiB9KTtcbiAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdCb290U3RyYXBDb21tYW5kJywgeyB2YWx1ZTogJ3NoIGJvb3RzdHJhcF9jZGsuc2ggJy5jb25jYXQoZWtzQ2x1c3Rlci5jbHVzdGVyTmFtZSkuY29uY2F0KCcgJykuY29uY2F0KHRoaXMucmVnaW9uKS5jb25jYXQoJyAnKS5jb25jYXQoY2x1c3RlckFkbWluLnJvbGVBcm4pfSk7XG5cbiBcbiAgfVxufVxuIl19